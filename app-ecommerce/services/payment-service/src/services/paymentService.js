const { Payment, PaymentMethod, Refund } = require('../models');
const stripeService = require('./stripeService');
const axios = require('axios');
const sequelize = require('../config/database');

class PaymentService {
  async createPayment(paymentData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate order exists
      await this.validateOrder(paymentData.orderId);
      
      // Get payment method if provided
      let paymentMethod = null;
      if (paymentData.paymentMethodId) {
        paymentMethod = await PaymentMethod.findByPk(paymentData.paymentMethodId);
        if (!paymentMethod || paymentMethod.userId !== paymentData.userId) {
          throw new Error('Invalid payment method');
        }
      }
      
      // Create payment record
      const payment = await Payment.create({
        orderId: paymentData.orderId,
        userId: paymentData.userId,
        paymentMethodId: paymentData.paymentMethodId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'USD',
        paymentProvider: paymentData.paymentProvider,
        description: paymentData.description,
        metadata: paymentData.metadata
      }, { transaction });
      
      // Process payment based on provider
      let providerResult;
      switch (paymentData.paymentProvider) {
        case 'stripe':
          providerResult = await stripeService.createPaymentIntent({
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            paymentMethodId: paymentMethod?.providerPaymentMethodId,
            customerId: paymentData.customerId,
            metadata: {
              paymentId: payment.id,
              orderId: paymentData.orderId
            }
          });
          break;
        case 'paypal':
          // PayPal integration would go here
          throw new Error('PayPal integration not implemented');
        case 'cash_on_delivery':
          providerResult = { status: 'pending' };
          break;
        default:
          throw new Error('Unsupported payment provider');
      }
      
      // Update payment with provider details
      await payment.update({
        providerPaymentIntentId: providerResult.id || providerResult.paymentIntentId,
        providerTransactionId: providerResult.transactionId,
        status: this.mapProviderStatus(providerResult.status),
        metadata: {
          ...payment.metadata,
          providerData: providerResult
        }
      }, { transaction });
      
      await transaction.commit();
      
      // Send notification
      await this.sendPaymentNotification(payment.id, 'payment_created');
      
      return this.getPaymentById(payment.id);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async confirmPayment(paymentId, confirmationData) {
    const payment = await Payment.findByPk(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'pending') {
      throw new Error('Payment cannot be confirmed in current status');
    }
    
    try {
      let providerResult;
      
      switch (payment.paymentProvider) {
        case 'stripe':
          providerResult = await stripeService.confirmPaymentIntent(
            payment.providerPaymentIntentId,
            confirmationData
          );
          break;
        case 'cash_on_delivery':
          providerResult = { status: 'completed' };
          break;
        default:
          throw new Error('Unsupported payment provider for confirmation');
      }
      
      await payment.update({
        status: this.mapProviderStatus(providerResult.status),
        providerTransactionId: providerResult.transactionId || payment.providerTransactionId,
        processedAt: providerResult.status === 'completed' ? new Date() : null,
        metadata: {
          ...payment.metadata,
          confirmationData: providerResult
        }
      });
      
      // Update order payment status
      if (providerResult.status === 'completed') {
        await this.updateOrderPaymentStatus(payment.orderId, 'paid', payment.id);
      }
      
      // Send notification
      await this.sendPaymentNotification(paymentId, 'payment_confirmed');
      
      return this.getPaymentById(paymentId);
      
    } catch (error) {
      await payment.update({
        status: 'failed',
        failureReason: error.message
      });
      
      await this.sendPaymentNotification(paymentId, 'payment_failed');
      throw error;
    }
  }
  
  async createRefund(refundData) {
    const transaction = await sequelize.transaction();
    
    try {
      const payment = await Payment.findByPk(refundData.paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }
      
      // Check if refund amount is valid
      const totalRefunded = await Refund.sum('amount', {
        where: { paymentId: refundData.paymentId, status: 'completed' }
      }) || 0;
      
      const availableAmount = parseFloat(payment.amount) - parseFloat(totalRefunded);
      
      if (parseFloat(refundData.amount) > availableAmount) {
        throw new Error('Refund amount exceeds available amount');
      }
      
      // Create refund record
      const refund = await Refund.create({
        paymentId: refundData.paymentId,
        orderId: payment.orderId,
        amount: refundData.amount,
        currency: payment.currency,
        reason: refundData.reason,
        description: refundData.description,
        requestedBy: refundData.requestedBy,
        metadata: refundData.metadata
      }, { transaction });
      
      // Process refund with provider
      let providerResult;
      switch (payment.paymentProvider) {
        case 'stripe':
          providerResult = await stripeService.createRefund({
            paymentIntentId: payment.providerPaymentIntentId,
            amount: refundData.amount,
            currency: payment.currency,
            reason: refundData.reason,
            metadata: {
              refundId: refund.id,
              orderId: payment.orderId
            }
          });
          break;
        case 'cash_on_delivery':
          providerResult = { status: 'completed', id: `cod_refund_${Date.now()}` };
          break;
        default:
          throw new Error('Refunds not supported for this payment provider');
      }
      
      // Update refund with provider details
      await refund.update({
        status: this.mapProviderStatus(providerResult.status),
        providerRefundId: providerResult.id,
        processedAt: providerResult.status === 'completed' ? new Date() : null
      }, { transaction });
      
      // Update payment refunded amount
      const newRefundedAmount = parseFloat(payment.refundedAmount) + parseFloat(refundData.amount);
      const paymentStatus = newRefundedAmount >= parseFloat(payment.amount) ? 'refunded' : 'partially_refunded';
      
      await payment.update({
        refundedAmount: newRefundedAmount,
        status: paymentStatus,
        refundedAt: providerResult.status === 'completed' ? new Date() : payment.refundedAt
      }, { transaction });
      
      await transaction.commit();
      
      // Send notification
      await this.sendPaymentNotification(refund.paymentId, 'refund_processed', { refundId: refund.id });
      
      return refund;
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async getPaymentById(paymentId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Refund,
          as: 'refunds'
        }
      ]
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    return payment;
  }
  
  async getPaymentsByUserId(userId, options = {}) {
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;
    
    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }
    
    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Refund,
          as: 'refunds'
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      payments: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      }
    };
  }
  
  async getPaymentsByOrderId(orderId) {
    return Payment.findAll({
      where: { orderId },
      include: [
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Refund,
          as: 'refunds'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
  
  async validateOrder(orderId) {
    try {
      const response = await axios.get(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Invalid order ID');
    }
  }
  
  async updateOrderPaymentStatus(orderId, paymentStatus, paymentId) {
    try {
      await axios.patch(`${process.env.ORDER_SERVICE_URL}/api/orders/${orderId}/status`, {
        paymentStatus,
        paymentId
      });
    } catch (error) {
      console.error('Failed to update order payment status:', error);
    }
  }
  
  mapProviderStatus(providerStatus) {
    const statusMap = {
      pending: 'pending',
      processing: 'processing',
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'pending',
      succeeded: 'completed',
      completed: 'completed',
      failed: 'failed',
      canceled: 'cancelled',
      cancelled: 'cancelled'
    };
    
    return statusMap[providerStatus] || 'pending';
  }
  
  async sendPaymentNotification(paymentId, type, data = {}) {
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/send`, {
        type,
        paymentId,
        data
      });
    } catch (error) {
      console.error('Failed to send payment notification:', error);
    }
  }
  
  async getPaymentStatistics(userId = null) {
    const whereClause = userId ? { userId } : {};
    
    const totalPayments = await Payment.count({ where: whereClause });
    const totalAmount = await Payment.sum('amount', { 
      where: { ...whereClause, status: 'completed' } 
    });
    const totalRefunds = await Payment.sum('refundedAmount', { where: whereClause });
    
    const statusCounts = await Payment.findAll({
      where: whereClause,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['status']
    });
    
    return {
      totalPayments,
      totalAmount: totalAmount || 0,
      totalRefunds: totalRefunds || 0,
      netAmount: (totalAmount || 0) - (totalRefunds || 0),
      statusBreakdown: statusCounts.reduce((acc, item) => {
        acc[item.status] = {
          count: parseInt(item.dataValues.count),
          total: parseFloat(item.dataValues.total || 0)
        };
        return acc;
      }, {})
    };
  }
}

module.exports = new PaymentService();