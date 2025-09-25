const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
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
  type: {
    type: DataTypes.ENUM(
      'stock_in',
      'stock_out',
      'adjustment',
      'reservation',
      'release',
      'transfer',
      'return',
      'damaged',
      'expired'
    ),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'main'
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
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
      fields: ['type']
    },
    {
      fields: ['referenceId']
    },
    {
      fields: ['warehouse']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = InventoryTransaction;