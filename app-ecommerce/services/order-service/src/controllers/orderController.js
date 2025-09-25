const orderService = require('../services/orderService');
const Joi = require('joi');

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  apartment: Joi.string().optional()
});

const orderItemSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
  productVariant: Joi.object().optional(),
  discountAmount: Joi.number().min(0).optional()
});

const createOrderSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: addressSchema.required(),
  billingAddress: addressSchema.required(),
  shippingMethod: Joi.string().required(),
  currency: Joi.string().length(3).default('USD'),
  discountAmount: Joi.number().min(0).default(0),
  shippingCost: Joi.number().min(0).default(0),
  taxRate: Joi.number().min(0).max(1).default(0.08),
  notes: Joi.string().max(1000).optional(),
  estimatedDeliveryDate: Joi.date().optional()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').required(),
  trackingNumber: Joi.string().optional(),
  actualDeliveryDate: Joi.date().optional(),
  notes: Joi.string().max(1000).optional()
});

class OrderController {
  async createOrder(req, res) {
    try {
      const { error, value } = createOrderSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const order = await orderService.createOrder(value);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order'
      });
    }
  }
  
  async getOrder(req, res) {
    try {
      const { orderId } = req.params;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }
      
      const order = await orderService.getOrderById(orderId);
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve order'
      });
    }
  }
  
  async getUserOrders(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await orderService.getOrdersByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });
      
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve orders'
      });
    }
  }
  
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { error, value } = updateOrderStatusSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const { status, ...updateData } = value;
      const order = await orderService.updateOrderStatus(orderId, status, updateData);
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update order status'
      });
    }
  }
  
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Cancellation reason is required'
        });
      }
      
      const order = await orderService.cancelOrder(orderId, reason);
      
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      const statusCode = error.message === 'Order not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to cancel order'
      });
    }
  }
  
  async getOrderStatistics(req, res) {
    try {
      const { userId } = req.query;
      
      const stats = await orderService.getOrderStatistics(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get order statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve order statistics'
      });
    }
  }
  
  async searchOrders(req, res) {
    try {
      const { orderNumber, status, startDate, endDate, page = 1, limit = 10 } = req.query;
      
      // This would be implemented based on specific search requirements
      res.json({
        success: true,
        message: 'Search functionality to be implemented',
        data: []
      });
    } catch (error) {
      console.error('Search orders error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search orders'
      });
    }
  }
}

module.exports = new OrderController();