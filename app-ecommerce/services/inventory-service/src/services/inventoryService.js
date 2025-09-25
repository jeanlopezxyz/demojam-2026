const { InventoryItem, InventoryTransaction, StockReservation } = require('../models');
const { redisClient } = require('../config/redis');
const axios = require('axios');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

class InventoryService {
  async createInventoryItem(itemData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate product exists
      await this.validateProduct(itemData.productId);
      
      // Create inventory item
      const inventoryItem = await InventoryItem.create({
        productId: itemData.productId,
        sku: itemData.sku,
        productName: itemData.productName,
        quantity: itemData.quantity || 0,
        minStockLevel: itemData.minStockLevel || 10,
        maxStockLevel: itemData.maxStockLevel,
        reorderPoint: itemData.reorderPoint || 5,
        location: itemData.location,
        warehouse: itemData.warehouse || 'main',
        supplier: itemData.supplier,
        costPrice: itemData.costPrice,
        trackingEnabled: itemData.trackingEnabled !== false,
        metadata: itemData.metadata
      }, { transaction });
      
      // Create initial transaction if quantity > 0
      if (itemData.quantity > 0) {
        await InventoryTransaction.create({
          inventoryItemId: inventoryItem.id,
          productId: itemData.productId,
          type: 'stock_in',
          quantity: itemData.quantity,
          previousQuantity: 0,
          newQuantity: itemData.quantity,
          reason: 'Initial stock',
          warehouse: itemData.warehouse || 'main',
          cost: itemData.costPrice ? itemData.costPrice * itemData.quantity : null,
          notes: 'Initial inventory setup'
        }, { transaction });
      }
      
      await transaction.commit();
      
      // Cache inventory data
      await this.cacheInventoryItem(inventoryItem);
      
      return inventoryItem;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async updateStock(productId, quantityChange, type, options = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const inventoryItem = await InventoryItem.findOne({
        where: { productId },
        lock: true,
        transaction
      });
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }
      
      const previousQuantity = inventoryItem.quantity;
      let newQuantity;
      
      switch (type) {
        case 'stock_in':
          newQuantity = previousQuantity + Math.abs(quantityChange);
          break;
        case 'stock_out':
          newQuantity = previousQuantity - Math.abs(quantityChange);
          if (newQuantity < 0) {
            throw new Error('Insufficient stock for deduction');
          }
          break;
        case 'adjustment':
          newQuantity = quantityChange;
          break;
        default:
          throw new Error('Invalid stock update type');
      }
      
      // Update inventory item
      await inventoryItem.update({
        quantity: newQuantity,
        lastRestockedAt: type === 'stock_in' ? new Date() : inventoryItem.lastRestockedAt,
        lastSoldAt: type === 'stock_out' ? new Date() : inventoryItem.lastSoldAt
      }, { transaction });
      
      // Create transaction record
      await InventoryTransaction.create({
        inventoryItemId: inventoryItem.id,
        productId,
        type,
        quantity: Math.abs(quantityChange),
        previousQuantity,
        newQuantity,
        reason: options.reason || `${type} operation`,
        reference: options.reference,
        referenceId: options.referenceId,
        performedBy: options.performedBy,
        cost: options.cost,
        location: options.location || inventoryItem.location,
        warehouse: options.warehouse || inventoryItem.warehouse,
        batchNumber: options.batchNumber,
        expiryDate: options.expiryDate,
        notes: options.notes,
        metadata: options.metadata
      }, { transaction });
      
      await transaction.commit();
      
      // Update cache
      await this.cacheInventoryItem(await this.getInventoryByProductId(productId));
      
      // Check for low stock alerts
      await this.checkLowStockAlert(inventoryItem);
      
      return this.getInventoryByProductId(productId);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async reserveStock(productId, quantity, options = {}) {
    const transaction = await sequelize.transaction();
    
    try {
      const inventoryItem = await InventoryItem.findOne({
        where: { productId },
        lock: true,
        transaction
      });
      
      if (!inventoryItem) {
        throw new Error('Inventory item not found');
      }
      
      const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
      
      if (availableQuantity < quantity) {
        throw new Error('Insufficient available stock for reservation');
      }
      
      // Create reservation
      const reservation = await StockReservation.create({
        inventoryItemId: inventoryItem.id,
        productId,
        orderId: options.orderId,
        userId: options.userId,
        quantity,
        reason: options.reason || 'order_processing',
        expiresAt: options.expiresAt,
        metadata: options.metadata
      }, { transaction });
      
      // Update reserved quantity
      await inventoryItem.update({
        reservedQuantity: inventoryItem.reservedQuantity + quantity
      }, { transaction });
      
      // Create transaction record
      await InventoryTransaction.create({
        inventoryItemId: inventoryItem.id,
        productId,
        type: 'reservation',
        quantity,
        previousQuantity: inventoryItem.quantity,
        newQuantity: inventoryItem.quantity,
        reason: 'Stock reserved',
        referenceId: reservation.id,
        performedBy: options.userId,
        warehouse: inventoryItem.warehouse,
        notes: `Reserved ${quantity} units for ${options.reason || 'order'}`
      }, { transaction });
      
      await transaction.commit();
      
      // Update cache
      await this.cacheInventoryItem(await this.getInventoryByProductId(productId));
      
      return reservation;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async releaseReservation(reservationId, fulfill = false) {
    const transaction = await sequelize.transaction();
    
    try {
      const reservation = await StockReservation.findByPk(reservationId, {
        include: [{ model: InventoryItem, as: 'inventoryItem' }],
        lock: true,
        transaction
      });
      
      if (!reservation || reservation.status !== 'active') {
        throw new Error('Active reservation not found');
      }
      
      const inventoryItem = reservation.inventoryItem;
      
      // Update reservation status
      await reservation.update({
        status: fulfill ? 'fulfilled' : 'cancelled',
        fulfilledAt: fulfill ? new Date() : null
      }, { transaction });
      
      // Update inventory quantities
      if (fulfill) {
        // Fulfill: reduce both quantity and reserved quantity
        await inventoryItem.update({
          quantity: inventoryItem.quantity - reservation.quantity,
          reservedQuantity: inventoryItem.reservedQuantity - reservation.quantity,
          lastSoldAt: new Date()
        }, { transaction });
      } else {
        // Cancel: only reduce reserved quantity
        await inventoryItem.update({
          reservedQuantity: inventoryItem.reservedQuantity - reservation.quantity
        }, { transaction });
      }
      
      // Create transaction record
      await InventoryTransaction.create({
        inventoryItemId: inventoryItem.id,
        productId: reservation.productId,
        type: fulfill ? 'stock_out' : 'release',
        quantity: reservation.quantity,
        previousQuantity: inventoryItem.quantity + (fulfill ? reservation.quantity : 0),
        newQuantity: inventoryItem.quantity,
        reason: fulfill ? 'Reservation fulfilled' : 'Reservation cancelled',
        referenceId: reservationId,
        warehouse: inventoryItem.warehouse,
        notes: `Reservation ${fulfill ? 'fulfilled' : 'cancelled'} for ${reservation.quantity} units`
      }, { transaction });
      
      await transaction.commit();
      
      // Update cache
      await this.cacheInventoryItem(await this.getInventoryByProductId(reservation.productId));
      
      return reservation;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async checkAvailability(productId, quantity) {
    try {
      // Try to get from cache first
      const cached = await redisClient.get(`inventory:${productId}`);
      
      if (cached) {
        const data = JSON.parse(cached);
        const availableQuantity = data.quantity - data.reservedQuantity;
        return {
          available: availableQuantity >= quantity,
          availableQuantity,
          requestedQuantity: quantity
        };
      }
      
      // Fallback to database
      const inventoryItem = await InventoryItem.findOne({
        where: { productId }
      });
      
      if (!inventoryItem) {
        return {
          available: false,
          availableQuantity: 0,
          requestedQuantity: quantity,
          error: 'Product not found in inventory'
        };
      }
      
      const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
      
      return {
        available: availableQuantity >= quantity,
        availableQuantity,
        requestedQuantity: quantity
      };
      
    } catch (error) {
      throw new Error(`Availability check failed: ${error.message}`);
    }
  }
  
  async getInventoryByProductId(productId) {
    const inventoryItem = await InventoryItem.findOne({
      where: { productId },
      include: [
        {
          model: StockReservation,
          as: 'reservations',
          where: { status: 'active' },
          required: false
        }
      ]
    });
    
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }
    
    return inventoryItem;
  }
  
  async getInventoryBySku(sku) {
    const inventoryItem = await InventoryItem.findOne({
      where: { sku },
      include: [
        {
          model: StockReservation,
          as: 'reservations',
          where: { status: 'active' },
          required: false
        }
      ]
    });
    
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }
    
    return inventoryItem;
  }
  
  async getLowStockItems(threshold = null) {
    const lowStockThreshold = threshold || process.env.LOW_STOCK_THRESHOLD || 10;
    
    const items = await InventoryItem.findAll({
      where: {
        [Op.and]: [
          sequelize.literal(`(quantity - "reservedQuantity") <= ${lowStockThreshold}`),
          { isActive: true },
          { trackingEnabled: true }
        ]
      },
      order: [
        [sequelize.literal('(quantity - "reservedQuantity")'), 'ASC']
      ]
    });
    
    return items;
  }
  
  async getInventoryHistory(productId, options = {}) {
    const { page = 1, limit = 20, type } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { productId };
    if (type) {
      whereClause.type = type;
    }
    
    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      }
    };
  }
  
  async expireReservations() {
    const transaction = await sequelize.transaction();
    
    try {
      const expiredReservations = await StockReservation.findAll({
        where: {
          status: 'active',
          expiresAt: { [Op.lt]: new Date() }
        },
        include: [{ model: InventoryItem, as: 'inventoryItem' }],
        transaction
      });
      
      for (const reservation of expiredReservations) {
        await reservation.update({ status: 'expired' }, { transaction });
        
        await reservation.inventoryItem.update({
          reservedQuantity: reservation.inventoryItem.reservedQuantity - reservation.quantity
        }, { transaction });
        
        await InventoryTransaction.create({
          inventoryItemId: reservation.inventoryItem.id,
          productId: reservation.productId,
          type: 'release',
          quantity: reservation.quantity,
          previousQuantity: reservation.inventoryItem.quantity,
          newQuantity: reservation.inventoryItem.quantity,
          reason: 'Reservation expired',
          referenceId: reservation.id,
          warehouse: reservation.inventoryItem.warehouse,
          notes: `Expired reservation for ${reservation.quantity} units`
        }, { transaction });
        
        // Update cache
        await this.cacheInventoryItem(reservation.inventoryItem);
      }
      
      await transaction.commit();
      
      console.log(`Expired ${expiredReservations.length} reservations`);
      
      return expiredReservations.length;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async cacheInventoryItem(inventoryItem) {
    try {
      const cacheData = {
        id: inventoryItem.id,
        productId: inventoryItem.productId,
        sku: inventoryItem.sku,
        quantity: inventoryItem.quantity,
        reservedQuantity: inventoryItem.reservedQuantity,
        availableQuantity: inventoryItem.quantity - inventoryItem.reservedQuantity,
        minStockLevel: inventoryItem.minStockLevel,
        reorderPoint: inventoryItem.reorderPoint,
        warehouse: inventoryItem.warehouse,
        isActive: inventoryItem.isActive,
        lastUpdated: new Date().toISOString()
      };
      
      await redisClient.setEx(`inventory:${inventoryItem.productId}`, 3600, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache update failed:', error);
    }
  }
  
  async validateProduct(productId) {
    try {
      const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Invalid product ID');
    }
  }
  
  async checkLowStockAlert(inventoryItem) {
    const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
    
    if (availableQuantity <= inventoryItem.reorderPoint) {
      try {
        await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
          type: 'low_stock_alert',
          productId: inventoryItem.productId,
          data: {
            sku: inventoryItem.sku,
            productName: inventoryItem.productName,
            availableQuantity,
            reorderPoint: inventoryItem.reorderPoint,
            warehouse: inventoryItem.warehouse
          }
        });
      } catch (error) {
        console.error('Failed to send low stock alert:', error);
      }
    }
  }
  
  async getInventoryStatistics(warehouse = null) {
    const whereClause = warehouse ? { warehouse } : {};
    
    const totalProducts = await InventoryItem.count({ 
      where: { ...whereClause, isActive: true } 
    });
    
    const totalQuantity = await InventoryItem.sum('quantity', { 
      where: { ...whereClause, isActive: true } 
    });
    
    const totalReserved = await InventoryItem.sum('reservedQuantity', { 
      where: { ...whereClause, isActive: true } 
    });
    
    const lowStockItems = await this.getLowStockItems();
    
    return {
      totalProducts,
      totalQuantity: totalQuantity || 0,
      totalReserved: totalReserved || 0,
      availableQuantity: (totalQuantity || 0) - (totalReserved || 0),
      lowStockItems: lowStockItems.length,
      warehouse
    };
  }
}

module.exports = new InventoryService();