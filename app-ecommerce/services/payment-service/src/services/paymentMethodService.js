const { PaymentMethod } = require('../models');
const stripeService = require('./stripeService');

class PaymentMethodService {
  async createPaymentMethod(paymentMethodData) {
    try {
      // Create payment method with provider
      let providerPaymentMethod;
      switch (paymentMethodData.provider) {
        case 'stripe':
          providerPaymentMethod = await stripeService.createPaymentMethod({
            card: paymentMethodData.card,
            billingDetails: paymentMethodData.billingDetails,
            customerId: paymentMethodData.customerId
          });
          break;
        default:
          throw new Error('Unsupported payment provider');
      }
      
      // Create payment method record
      const paymentMethod = await PaymentMethod.create({
        userId: paymentMethodData.userId,
        type: paymentMethodData.type,
        provider: paymentMethodData.provider,
        providerPaymentMethodId: providerPaymentMethod.id,
        isDefault: paymentMethodData.isDefault || false,
        nickname: paymentMethodData.nickname,
        maskedCardNumber: providerPaymentMethod.card?.last4 ? `****${providerPaymentMethod.card.last4}` : null,
        cardBrand: providerPaymentMethod.card?.brand,
        cardExpMonth: providerPaymentMethod.card?.expMonth,
        cardExpYear: providerPaymentMethod.card?.expYear,
        cardHolderName: paymentMethodData.cardHolderName,
        billingAddress: paymentMethodData.billingAddress,
        metadata: paymentMethodData.metadata
      });
      
      return paymentMethod.toSafeJSON();
    } catch (error) {
      throw new Error(`Failed to create payment method: ${error.message}`);
    }
  }
  
  async getPaymentMethodsByUserId(userId) {
    const paymentMethods = await PaymentMethod.findAll({
      where: { userId, isActive: true },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    
    return paymentMethods.map(pm => pm.toSafeJSON());
  }
  
  async getPaymentMethodById(paymentMethodId, userId) {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: paymentMethodId, userId }
    });
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    return paymentMethod.toSafeJSON();
  }
  
  async updatePaymentMethod(paymentMethodId, userId, updateData) {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: paymentMethodId, userId }
    });
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    // Update allowed fields
    const allowedUpdates = ['nickname', 'isDefault', 'billingAddress'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (updateData.hasOwnProperty(field)) {
        updates[field] = updateData[field];
      }
    }
    
    await paymentMethod.update(updates);
    
    // Update last used time if being set as default
    if (updates.isDefault) {
      await paymentMethod.update({ lastUsedAt: new Date() });
    }
    
    return paymentMethod.toSafeJSON();
  }
  
  async deletePaymentMethod(paymentMethodId, userId) {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: paymentMethodId, userId }
    });
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    // Delete from provider
    try {
      switch (paymentMethod.provider) {
        case 'stripe':
          await stripeService.deletePaymentMethod(paymentMethod.providerPaymentMethodId);
          break;
        default:
          // Handle other providers
          break;
      }
    } catch (error) {
      console.error('Failed to delete payment method from provider:', error);
      // Continue with local deletion even if provider deletion fails
    }
    
    // Soft delete by marking as inactive
    await paymentMethod.update({ isActive: false });
    
    // If this was the default, set another one as default
    if (paymentMethod.isDefault) {
      const nextPaymentMethod = await PaymentMethod.findOne({
        where: { userId, isActive: true, id: { [require('sequelize').Op.ne]: paymentMethodId } },
        order: [['createdAt', 'DESC']]
      });
      
      if (nextPaymentMethod) {
        await nextPaymentMethod.update({ isDefault: true });
      }
    }
    
    return { success: true, message: 'Payment method deleted successfully' };
  }
  
  async setDefaultPaymentMethod(paymentMethodId, userId) {
    const paymentMethod = await PaymentMethod.findOne({
      where: { id: paymentMethodId, userId, isActive: true }
    });
    
    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }
    
    // Update all others to not be default
    await PaymentMethod.update(
      { isDefault: false },
      { where: { userId, isDefault: true } }
    );
    
    // Set this one as default
    await paymentMethod.update({ 
      isDefault: true,
      lastUsedAt: new Date()
    });
    
    return paymentMethod.toSafeJSON();
  }
  
  async getDefaultPaymentMethod(userId) {
    const paymentMethod = await PaymentMethod.findOne({
      where: { userId, isDefault: true, isActive: true }
    });
    
    if (!paymentMethod) {
      throw new Error('No default payment method found');
    }
    
    return paymentMethod.toSafeJSON();
  }
  
  async updateLastUsed(paymentMethodId) {
    await PaymentMethod.update(
      { lastUsedAt: new Date() },
      { where: { id: paymentMethodId } }
    );
  }
}

module.exports = new PaymentMethodService();