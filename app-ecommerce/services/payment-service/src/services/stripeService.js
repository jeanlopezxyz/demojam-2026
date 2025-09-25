const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCustomer(customerData) {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.phone,
        metadata: {
          userId: customerData.userId
        }
      });
      
      return customer;
    } catch (error) {
      throw new Error(`Stripe customer creation failed: ${error.message}`);
    }
  }
  
  async createPaymentIntent(paymentData) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        customer: paymentData.customerId,
        payment_method: paymentData.paymentMethodId,
        confirmation_method: 'manual',
        confirm: false,
        metadata: paymentData.metadata || {}
      });
      
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error) {
      throw new Error(`Stripe payment intent creation failed: ${error.message}`);
    }
  }
  
  async confirmPaymentIntent(paymentIntentId, confirmationData = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: confirmationData.paymentMethodId,
        return_url: confirmationData.returnUrl
      });
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        transactionId: paymentIntent.charges?.data[0]?.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error) {
      throw new Error(`Stripe payment confirmation failed: ${error.message}`);
    }
  }
  
  async createPaymentMethod(paymentMethodData) {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: paymentMethodData.card,
        billing_details: paymentMethodData.billingDetails
      });
      
      if (paymentMethodData.customerId) {
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: paymentMethodData.customerId
        });
      }
      
      return {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        } : null
      };
    } catch (error) {
      throw new Error(`Stripe payment method creation failed: ${error.message}`);
    }
  }
  
  async createRefund(refundData) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: refundData.paymentIntentId,
        amount: refundData.amount ? Math.round(refundData.amount * 100) : undefined,
        reason: this.mapRefundReason(refundData.reason),
        metadata: refundData.metadata || {}
      });
      
      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
        currency: refund.currency,
        reason: refund.reason
      };
    } catch (error) {
      throw new Error(`Stripe refund failed: ${error.message}`);
    }
  }
  
  async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        charges: paymentIntent.charges?.data.map(charge => ({
          id: charge.id,
          status: charge.status,
          amount: charge.amount / 100,
          created: new Date(charge.created * 1000)
        }))
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  }
  
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      
      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year
        } : null,
        created: new Date(pm.created * 1000)
      }));
    } catch (error) {
      throw new Error(`Failed to retrieve payment methods: ${error.message}`);
    }
  }
  
  async deletePaymentMethod(paymentMethodId) {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  }
  
  mapRefundReason(reason) {
    const reasonMap = {
      customer_request: 'requested_by_customer',
      duplicate_charge: 'duplicate',
      fraudulent: 'fraudulent',
      order_cancelled: 'requested_by_customer',
      defective_product: 'requested_by_customer',
      other: 'requested_by_customer'
    };
    
    return reasonMap[reason] || 'requested_by_customer';
  }
  
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Handle successful payment
          break;
        case 'payment_intent.payment_failed':
          // Handle failed payment
          break;
        case 'charge.dispute.created':
          // Handle chargeback
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();