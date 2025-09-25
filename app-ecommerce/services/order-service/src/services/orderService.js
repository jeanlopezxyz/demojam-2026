const { Order, OrderItem } = require('../models');
const axios = require('axios');
const sequelize = require('../config/database');

class OrderService {
  async createOrder(orderData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate user exists
      await this.validateUser(orderData.userId);
      
      // Validate products and get pricing
      const validatedItems = await this.validateAndPriceItems(orderData.items);
      
      // Check inventory availability
      await this.checkInventoryAvailability(validatedItems);
      
      // Calculate totals
      const calculations = this.calculateOrderTotals(validatedItems, orderData);
      
      // Create order
      const order = await Order.create({
        userId: orderData.userId,
        totalAmount: calculations.totalAmount,
        currency: orderData.currency || 'USD',
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        shippingMethod: orderData.shippingMethod,
        shippingCost: calculations.shippingCost,
        taxAmount: calculations.taxAmount,
        discountAmount: calculations.discountAmount,
        notes: orderData.notes,
        estimatedDeliveryDate: orderData.estimatedDeliveryDate
      }, { transaction });
      
      // Create order items
      const orderItems = validatedItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productVariant: item.productVariant,
        discountAmount: item.discountAmount || 0
      }));
      
      await OrderItem.bulkCreate(orderItems, { transaction });
      
      // Reserve inventory
      await this.reserveInventory(validatedItems);
      
      // Send notification
      await this.sendOrderNotification(order.id, 'order_created');
      
      await transaction.commit();
      
      // Return order with items
      return this.getOrderById(order.id);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  }
  
  async getOrdersByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      orders: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      }
    };
  }
  
  async updateOrderStatus(orderId, status, updateData = {}) {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Validate status transition
    this.validateStatusTransition(order.status, status);
    
    const updateFields = { status, ...updateData };
    
    // Set delivery date if status is delivered
    if (status === 'delivered' && !updateFields.actualDeliveryDate) {
      updateFields.actualDeliveryDate = new Date();
    }
    
    await order.update(updateFields);
    
    // Send notification for status update
    await this.sendOrderNotification(orderId, 'status_updated', { newStatus: status });
    
    // Handle inventory based on status
    if (status === 'cancelled') {
      await this.releaseInventory(orderId);
    }
    
    return this.getOrderById(orderId);
  }
  
  async cancelOrder(orderId, reason) {
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Order cannot be cancelled in current status');
    }
    
    await order.update({
      status: 'cancelled',
      notes: order.notes ? `${order.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`
    });
    
    // Release inventory
    await this.releaseInventory(orderId);
    
    // Send notification
    await this.sendOrderNotification(orderId, 'order_cancelled', { reason });
    
    return this.getOrderById(orderId);
  }
  
  async validateUser(userId) {
    try {
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Invalid user ID');
    }
  }
  
  async validateAndPriceItems(items) {
    const validatedItems = [];
    
    for (const item of items) {
      try {
        const response = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`);
        const product = response.data.data;
        
        validatedItems.push({
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
          productVariant: item.productVariant,
          discountAmount: item.discountAmount || 0
        });
      } catch (error) {
        throw new Error(`Invalid product ID: ${item.productId}`);
      }
    }
    
    return validatedItems;
  }
  
  async checkInventoryAvailability(items) {
    for (const item of items) {
      try {
        const response = await axios.get(
          `${process.env.INVENTORY_SERVICE_URL}/api/inventory/check/${item.productId}?quantity=${item.quantity}`
        );
        
        if (!response.data.available) {
          throw new Error(`Insufficient inventory for product: ${item.productName}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          throw new Error(`Product not found in inventory: ${item.productName}`);
        }
        throw error;
      }
    }
  }
  
  async reserveInventory(items) {
    for (const item of items) {
      try {
        await axios.post(`${process.env.INVENTORY_SERVICE_URL}/api/inventory/reserve`, {
          productId: item.productId,
          quantity: item.quantity
        });
      } catch (error) {
        console.error('Failed to reserve inventory:', error);
        // In a real system, you might want to implement compensation logic
      }
    }
  }
  
  async releaseInventory(orderId) {
    try {
      const order = await this.getOrderById(orderId);
      
      for (const item of order.items) {
        await axios.post(`${process.env.INVENTORY_SERVICE_URL}/api/inventory/release`, {
          productId: item.productId,
          quantity: item.quantity
        });
      }
    } catch (error) {
      console.error('Failed to release inventory:', error);
    }
  }
  
  calculateOrderTotals(items, orderData) {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
    const discountAmount = parseFloat(orderData.discountAmount || 0);
    const shippingCost = parseFloat(orderData.shippingCost || 0);
    const taxRate = parseFloat(orderData.taxRate || 0.08); // 8% default tax
    const taxAmount = (subtotal - discountAmount + shippingCost) * taxRate;
    const totalAmount = subtotal - discountAmount + shippingCost + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      totalAmount
    };
  }
  
  validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: []
    };
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
  
  async sendOrderNotification(orderId, type, data = {}) {
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
        type,
        orderId,
        data
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Don't throw error as notification failure shouldn't break order processing
    }
  }
  
  async getOrderStatistics(userId = null) {
    const whereClause = userId ? { userId } : {};
    
    const totalOrders = await Order.count({ where: whereClause });
    const totalRevenue = await Order.sum('totalAmount', { where: { ...whereClause, status: 'delivered' } });
    
    const statusCounts = await Order.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    });
    
    return {
      totalOrders,
      totalRevenue: totalRevenue || 0,
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    };
  }
}

module.exports = new OrderService();