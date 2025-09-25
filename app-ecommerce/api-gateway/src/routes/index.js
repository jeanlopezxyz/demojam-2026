const express = require('express');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy,
  paymentServiceProxy,
  inventoryServiceProxy,
  notificationServiceProxy
} = require('../middleware/proxy');

const router = express.Router();

router.use('/api/users/register', userServiceProxy);
router.use('/api/users/login', userServiceProxy);
router.use('/api/users', authenticate, userServiceProxy);

router.use('/api/products/search', optionalAuth, productServiceProxy);
router.use('/api/products/featured', optionalAuth, productServiceProxy);
router.use('/api/products/categories', optionalAuth, productServiceProxy);
router.use('/api/products/category', optionalAuth, productServiceProxy);
router.use('/api/products/slug', optionalAuth, productServiceProxy);
router.use('/api/products/:id/reviews', authenticate, productServiceProxy);
router.use('/api/products/:id', optionalAuth, productServiceProxy);
router.use('/api/products', optionalAuth, productServiceProxy);

router.use('/api/orders', authenticate, orderServiceProxy);

router.use('/api/payments', authenticate, paymentServiceProxy);
router.use('/api/payment-methods', authenticate, paymentServiceProxy);

router.use('/api/inventory', authenticate, authorize('admin', 'seller'), inventoryServiceProxy);

router.use('/api/notifications', authenticate, notificationServiceProxy);
router.use('/api/templates', authenticate, authorize('admin'), notificationServiceProxy);

module.exports = router;