const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StockReservation = sequelize.define('StockReservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  inventoryItemId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'InventoryItems',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'fulfilled', 'expired', 'cancelled'),
    defaultValue: 'active'
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'order_processing'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fulfilledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['inventoryItemId']
    },
    {
      fields: ['productId']
    },
    {
      fields: ['orderId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['expiresAt']
    }
  ],
  hooks: {
    beforeCreate: (reservation) => {
      if (!reservation.expiresAt) {
        const expiryMinutes = parseInt(process.env.RESERVATION_EXPIRY_MINUTES) || 30;
        reservation.expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
      }
    }
  }
});

module.exports = StockReservation;