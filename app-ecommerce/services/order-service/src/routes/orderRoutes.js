const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:orderId', orderController.getOrder);

// Get orders for a specific user
router.get('/user/:userId', orderController.getUserOrders);

// Update order status
router.patch('/:orderId/status', orderController.updateOrderStatus);

// Cancel order
router.patch('/:orderId/cancel', orderController.cancelOrder);

// Get order statistics
router.get('/admin/statistics', orderController.getOrderStatistics);

// Search orders
router.get('/admin/search', orderController.searchOrders);

module.exports = router;