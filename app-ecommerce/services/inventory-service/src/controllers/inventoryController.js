const inventoryService = require('../services/inventoryService');
const Joi = require('joi');

const createInventorySchema = Joi.object({
  productId: Joi.string().uuid().required(),
  sku: Joi.string().required(),
  productName: Joi.string().required(),
  quantity: Joi.number().integer().min(0).default(0),
  minStockLevel: Joi.number().integer().min(0).default(10),
  maxStockLevel: Joi.number().integer().min(0).optional(),
  reorderPoint: Joi.number().integer().min(0).default(5),
  location: Joi.string().optional(),
  warehouse: Joi.string().default('main'),
  supplier: Joi.string().optional(),
  costPrice: Joi.number().positive().optional(),
  trackingEnabled: Joi.boolean().default(true),
  metadata: Joi.object().optional()
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().required(),
  type: Joi.string().valid('stock_in', 'stock_out', 'adjustment').required(),
  reason: Joi.string().required(),
  reference: Joi.string().optional(),
  referenceId: Joi.string().uuid().optional(),
  performedBy: Joi.string().uuid().optional(),
  cost: Joi.number().positive().optional(),
  location: Joi.string().optional(),
  warehouse: Joi.string().optional(),
  batchNumber: Joi.string().optional(),
  expiryDate: Joi.date().optional(),
  notes: Joi.string().max(500).optional(),
  metadata: Joi.object().optional()
});

const reserveStockSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  orderId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),
  reason: Joi.string().default('order_processing'),
  expiresAt: Joi.date().optional(),
  metadata: Joi.object().optional()
});

class InventoryController {
  async createInventoryItem(req, res) {
    try {
      const { error, value } = createInventorySchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const inventoryItem = await inventoryService.createInventoryItem(value);
      
      res.status(201).json({
        success: true,
        message: 'Inventory item created successfully',
        data: inventoryItem
      });
    } catch (error) {
      console.error('Create inventory item error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create inventory item'
      });
    }
  }
  
  async getInventoryByProduct(req, res) {
    try {
      const { productId } = req.params;
      
      const inventory = await inventoryService.getInventoryByProductId(productId);
      
      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Get inventory error:', error);
      const statusCode = error.message === 'Inventory item not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve inventory'
      });
    }
  }
  
  async getInventoryBySku(req, res) {
    try {
      const { sku } = req.params;
      
      const inventory = await inventoryService.getInventoryBySku(sku);
      
      res.json({
        success: true,
        data: inventory
      });
    } catch (error) {
      console.error('Get inventory by SKU error:', error);
      const statusCode = error.message === 'Inventory item not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve inventory'
      });
    }
  }
  
  async updateStock(req, res) {
    try {
      const { productId } = req.params;
      const { error, value } = updateStockSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const { quantity, type, ...options } = value;
      const inventory = await inventoryService.updateStock(productId, quantity, type, options);
      
      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: inventory
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update stock'
      });
    }
  }
  
  async reserveStock(req, res) {
    try {
      const { error, value } = reserveStockSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const reservation = await inventoryService.reserveStock(value.productId, value.quantity, value);
      
      res.status(201).json({
        success: true,
        message: 'Stock reserved successfully',
        data: reservation
      });
    } catch (error) {
      console.error('Reserve stock error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reserve stock'
      });
    }
  }
  
  async releaseReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const { fulfill = false } = req.body;
      
      const reservation = await inventoryService.releaseReservation(reservationId, fulfill);
      
      res.json({
        success: true,
        message: `Reservation ${fulfill ? 'fulfilled' : 'cancelled'} successfully`,
        data: reservation
      });
    } catch (error) {
      console.error('Release reservation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to release reservation'
      });
    }
  }
  
  async checkAvailability(req, res) {
    try {
      const { productId } = req.params;
      const { quantity = 1 } = req.query;
      
      const availability = await inventoryService.checkAvailability(productId, parseInt(quantity));
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check availability'
      });
    }
  }
  
  async getLowStockItems(req, res) {
    try {
      const { threshold } = req.query;
      
      const items = await inventoryService.getLowStockItems(threshold ? parseInt(threshold) : null);
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Get low stock items error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve low stock items'
      });
    }
  }
  
  async getInventoryHistory(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 20, type } = req.query;
      
      const history = await inventoryService.getInventoryHistory(productId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type
      });
      
      res.json({
        success: true,
        data: history.transactions,
        pagination: history.pagination
      });
    } catch (error) {
      console.error('Get inventory history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve inventory history'
      });
    }
  }
  
  async getInventoryStatistics(req, res) {
    try {
      const { warehouse } = req.query;
      
      const stats = await inventoryService.getInventoryStatistics(warehouse);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get inventory statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve inventory statistics'
      });
    }
  }
  
  async expireReservations(req, res) {
    try {
      const expiredCount = await inventoryService.expireReservations();
      
      res.json({
        success: true,
        message: `Expired ${expiredCount} reservations`,
        data: { expiredCount }
      });
    } catch (error) {
      console.error('Expire reservations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to expire reservations'
      });
    }
  }
}

module.exports = new InventoryController();