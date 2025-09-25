const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

// Payment method routes
router.post('/', paymentMethodController.createPaymentMethod);
router.get('/user/:userId', paymentMethodController.getUserPaymentMethods);
router.get('/:paymentMethodId', paymentMethodController.getPaymentMethod);
router.put('/:paymentMethodId', paymentMethodController.updatePaymentMethod);
router.delete('/:paymentMethodId', paymentMethodController.deletePaymentMethod);

// Default payment method
router.post('/:paymentMethodId/default', paymentMethodController.setDefaultPaymentMethod);
router.get('/user/:userId/default', paymentMethodController.getDefaultPaymentMethod);

module.exports = router;