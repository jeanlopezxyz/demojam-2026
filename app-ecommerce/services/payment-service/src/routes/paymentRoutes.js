const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment routes
router.post('/', paymentController.createPayment);
router.get('/:paymentId', paymentController.getPayment);
router.post('/:paymentId/confirm', paymentController.confirmPayment);
router.get('/user/:userId', paymentController.getUserPayments);
router.get('/order/:orderId', paymentController.getOrderPayments);

// Refund routes
router.post('/refunds', paymentController.createRefund);

// Statistics
router.get('/admin/statistics', paymentController.getPaymentStatistics);

// Webhook
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;