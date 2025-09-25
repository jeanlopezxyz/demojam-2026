const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'bank_account', 'digital_wallet'),
    allowNull: false
  },
  provider: {
    type: DataTypes.ENUM('stripe', 'paypal', 'apple_pay', 'google_pay'),
    allowNull: false
  },
  providerPaymentMethodId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Encrypted card details (last 4 digits, brand, etc.)
  maskedCardNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cardBrand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cardExpMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  cardExpYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: new Date().getFullYear()
    }
  },
  cardHolderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['provider', 'providerPaymentMethodId'],
      unique: true
    },
    {
      fields: ['isDefault']
    }
  ],
  hooks: {
    beforeCreate: async (paymentMethod) => {
      // If this is set as default, unset other defaults for this user
      if (paymentMethod.isDefault) {
        await PaymentMethod.update(
          { isDefault: false },
          { where: { userId: paymentMethod.userId, isDefault: true } }
        );
      }
    },
    beforeUpdate: async (paymentMethod) => {
      // If this is being set as default, unset other defaults for this user
      if (paymentMethod.isDefault && paymentMethod.changed('isDefault')) {
        await PaymentMethod.update(
          { isDefault: false },
          { 
            where: { 
              userId: paymentMethod.userId, 
              isDefault: true,
              id: { [sequelize.Op.ne]: paymentMethod.id }
            } 
          }
        );
      }
    }
  }
});

// Method to safely return payment method without sensitive data
PaymentMethod.prototype.toSafeJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.providerPaymentMethodId;
  return values;
};

module.exports = PaymentMethod;