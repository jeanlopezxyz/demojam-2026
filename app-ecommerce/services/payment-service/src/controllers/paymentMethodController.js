const paymentMethodService = require('../services/paymentMethodService');
const Joi = require('joi');

const createPaymentMethodSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().valid('credit_card', 'debit_card', 'bank_account', 'digital_wallet').required(),
  provider: Joi.string().valid('stripe', 'paypal', 'apple_pay', 'google_pay').required(),
  card: Joi.object({
    number: Joi.string().required(),
    exp_month: Joi.number().integer().min(1).max(12).required(),
    exp_year: Joi.number().integer().min(new Date().getFullYear()).required(),
    cvc: Joi.string().required()
  }).when('type', { is: ['credit_card', 'debit_card'], then: Joi.required() }),
  billingDetails: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.object({
      line1: Joi.string().required(),
      line2: Joi.string().optional(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postal_code: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }).required(),
  isDefault: Joi.boolean().default(false),
  nickname: Joi.string().max(50).optional(),
  cardHolderName: Joi.string().max(100).optional(),
  customerId: Joi.string().optional(),
  metadata: Joi.object().optional()
});

const updatePaymentMethodSchema = Joi.object({
  nickname: Joi.string().max(50).optional(),
  isDefault: Joi.boolean().optional(),
  billingAddress: Joi.object().optional()
});

class PaymentMethodController {
  async createPaymentMethod(req, res) {
    try {
      const { error, value } = createPaymentMethodSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const paymentMethod = await paymentMethodService.createPaymentMethod(value);
      
      res.status(201).json({
        success: true,
        message: 'Payment method created successfully',
        data: paymentMethod
      });
    } catch (error) {
      console.error('Create payment method error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment method'
      });
    }
  }
  
  async getUserPaymentMethods(req, res) {
    try {
      const { userId } = req.params;
      
      const paymentMethods = await paymentMethodService.getPaymentMethodsByUserId(userId);
      
      res.json({
        success: true,
        data: paymentMethods
      });
    } catch (error) {
      console.error('Get user payment methods error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve payment methods'
      });
    }
  }
  
  async getPaymentMethod(req, res) {
    try {
      const { paymentMethodId } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const paymentMethod = await paymentMethodService.getPaymentMethodById(paymentMethodId, userId);
      
      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error) {
      console.error('Get payment method error:', error);
      const statusCode = error.message === 'Payment method not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve payment method'
      });
    }
  }
  
  async updatePaymentMethod(req, res) {
    try {
      const { paymentMethodId } = req.params;
      const { userId } = req.query;
      const { error, value } = updatePaymentMethodSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const paymentMethod = await paymentMethodService.updatePaymentMethod(paymentMethodId, userId, value);
      
      res.json({
        success: true,
        message: 'Payment method updated successfully',
        data: paymentMethod
      });
    } catch (error) {
      console.error('Update payment method error:', error);
      const statusCode = error.message === 'Payment method not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to update payment method'
      });
    }
  }
  
  async deletePaymentMethod(req, res) {
    try {
      const { paymentMethodId } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const result = await paymentMethodService.deletePaymentMethod(paymentMethodId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete payment method error:', error);
      const statusCode = error.message === 'Payment method not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to delete payment method'
      });
    }
  }
  
  async setDefaultPaymentMethod(req, res) {
    try {
      const { paymentMethodId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      const paymentMethod = await paymentMethodService.setDefaultPaymentMethod(paymentMethodId, userId);
      
      res.json({
        success: true,
        message: 'Default payment method updated successfully',
        data: paymentMethod
      });
    } catch (error) {
      console.error('Set default payment method error:', error);
      const statusCode = error.message === 'Payment method not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to set default payment method'
      });
    }
  }
  
  async getDefaultPaymentMethod(req, res) {
    try {
      const { userId } = req.params;
      
      const paymentMethod = await paymentMethodService.getDefaultPaymentMethod(userId);
      
      res.json({
        success: true,
        data: paymentMethod
      });
    } catch (error) {
      console.error('Get default payment method error:', error);
      const statusCode = error.message === 'No default payment method found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Failed to retrieve default payment method'
      });
    }
  }
}

module.exports = new PaymentMethodController();