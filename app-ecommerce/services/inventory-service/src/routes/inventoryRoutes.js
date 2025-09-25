const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory item management
router.post('/', inventoryController.createInventoryItem);
router.get('/product/:productId', inventoryController.getInventoryByProduct);
router.get('/sku/:sku', inventoryController.getInventoryBySku);
router.patch('/product/:productId/stock', inventoryController.updateStock);

// Stock availability
router.get('/check/:productId', inventoryController.checkAvailability);

// Stock reservations
router.post('/reserve', inventoryController.reserveStock);
router.patch('/reservations/:reservationId', inventoryController.releaseReservation);

// Inventory history and reporting
router.get('/product/:productId/history', inventoryController.getInventoryHistory);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/statistics', inventoryController.getInventoryStatistics);

// Maintenance operations
router.post('/expire-reservations', inventoryController.expireReservations);

module.exports = router;