const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');
const StockReservation = require('./StockReservation');

// Define associations
InventoryItem.hasMany(InventoryTransaction, {
  foreignKey: 'inventoryItemId',
  as: 'transactions',
  onDelete: 'CASCADE'
});

InventoryTransaction.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem'
});

InventoryItem.hasMany(StockReservation, {
  foreignKey: 'inventoryItemId',
  as: 'reservations',
  onDelete: 'CASCADE'
});

StockReservation.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem'
});

module.exports = {
  InventoryItem,
  InventoryTransaction,
  StockReservation
};