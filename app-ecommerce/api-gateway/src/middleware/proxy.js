const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

const createServiceProxy = (serviceUrl, pathRewrite = {}) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite,
    timeout: 30000,
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err);
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Role', req.user.role);
        proxyReq.setHeader('X-User-Email', req.user.email);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['X-Gateway'] = 'E-commerce-API-Gateway';
    }
  });
};

const userServiceProxy = createServiceProxy(services.USER_SERVICE.url, {
  '^/api/users': '/api/users'
});

const productServiceProxy = createServiceProxy(services.PRODUCT_SERVICE.url, {
  '^/api/products': '/api/products'
});

const orderServiceProxy = createServiceProxy(services.ORDER_SERVICE.url, {
  '^/api/orders': '/api/orders'
});

const paymentServiceProxy = createServiceProxy(services.PAYMENT_SERVICE.url, {
  '^/api/payments': '/api/payments',
  '^/api/payment-methods': '/api/payment-methods'
});

const inventoryServiceProxy = createServiceProxy(services.INVENTORY_SERVICE.url, {
  '^/api/inventory': '/api/inventory'
});

const notificationServiceProxy = createServiceProxy(services.NOTIFICATION_SERVICE.url, {
  '^/api/notifications': '/api/notifications',
  '^/api/templates': '/api/templates'
});

module.exports = {
  userServiceProxy,
  productServiceProxy,
  orderServiceProxy,
  paymentServiceProxy,
  inventoryServiceProxy,
  notificationServiceProxy
};