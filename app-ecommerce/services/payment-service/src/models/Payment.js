const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  paymentMethodId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'PaymentMethods',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
      'refunded',
      'partially_refunded'
    ),
    defaultValue: 'pending'
  },
  paymentProvider: {
    type: DataTypes.ENUM('stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'),
    allowNull: false
  },
  providerTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  providerPaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentType: {
    type: DataTypes.ENUM('payment', 'refund', 'partial_refund'),
    defaultValue: 'payment'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['orderId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentProvider']
    },
    {
      fields: ['providerTransactionId']
    }
  ]
});

module.exports = Payment;