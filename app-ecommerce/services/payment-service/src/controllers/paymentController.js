const paymentService = require('../services/paymentService');
const Joi = require('joi');

const createPaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  paymentMethodId: Joi.string().uuid().optional(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  paymentProvider: Joi.string().valid('stripe', 'paypal', 'bank_transfer', 'cash_on_delivery').required(),
  description: Joi.string().max(500).optional(),
  customerId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

const confirmPaymentSchema = Joi.object({
  paymentMethodId: Joi.string().optional(),
  returnUrl: Joi.string().uri().optional()
});

const createRefundSchema = Joi.object({
  paymentId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().valid(
    'customer_request',
    'duplicate_charge',
    'fraudulent',
    'order_cancelled',
    'defective_product',
    'other'
  ).required(),
  description: Joi.string().max(500).optional(),
  requestedBy: Joi.string().uuid().required(),
  metadata: Joi.object().optional()
});

class PaymentController {
  async createPayment(req, res) {
    try {
      const { error, value } = createPaymentSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const payment = await paymentService.createPayment(value);
      
      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment'
      });
    }
  }
  
  async confirmPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { error, value } = confirmPaymentSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const payment = await paymentService.confirmPayment(paymentId, value);
      
      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: payment
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      const statusCode = error.message === 'Payment not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to confirm payment'
      });
    }
  }
  
  async getPayment(req, res) {
    try {
      const { paymentId } = req.params;
      
      const payment = await paymentService.getPaymentById(paymentId);
      
      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      const statusCode = error.message === 'Payment not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve payment'
      });
    }
  }
  
  async getUserPayments(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const result = await paymentService.getPaymentsByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });
      
      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve payments'
      });
    }
  }
  
  async getOrderPayments(req, res) {
    try {
      const { orderId } = req.params;
      
      const payments = await paymentService.getPaymentsByOrderId(orderId);
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get order payments error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve order payments'
      });
    }
  }
  
  async createRefund(req, res) {
    try {
      const { error, value } = createRefundSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const refund = await paymentService.createRefund(value);
      
      res.status(201).json({
        success: true,
        message: 'Refund created successfully',
        data: refund
      });
    } catch (error) {
      console.error('Create refund error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create refund'
      });
    }
  }
  
  async getPaymentStatistics(req, res) {
    try {
      const { userId } = req.query;
      
      const stats = await paymentService.getPaymentStatistics(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payment statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve payment statistics'
      });
    }
  }
  
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      const rawBody = req.body;
      
      // This would handle Stripe webhook validation and processing
      // Implementation depends on specific webhook requirements
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }
}

module.exports = new PaymentController();