const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  reservedQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  availableQuantity: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.quantity - this.reservedQuantity;
    }
  },
  minStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  maxStockLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
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
  supplier: {
    type: DataTypes.STRING,
    allowNull: true
  },
  costPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  trackingEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastRestockedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastSoldAt: {
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
      fields: ['productId']
    },
    {
      fields: ['sku']
    },
    {
      fields: ['warehouse']
    },
    {
      fields: ['quantity']
    },
    {
      fields: ['isActive']
    }
  ],
  hooks: {
    afterUpdate: async (inventoryItem, options) => {
      // Check for low stock alerts
      if (inventoryItem.changed('quantity') || inventoryItem.changed('reservedQuantity')) {
        const availableQuantity = inventoryItem.quantity - inventoryItem.reservedQuantity;
        
        if (availableQuantity <= inventoryItem.reorderPoint) {
          // Trigger low stock alert
          console.log(`Low stock alert for ${inventoryItem.sku}: ${availableQuantity} units remaining`);
        }
      }
    }
  }
});

module.exports = InventoryItem;