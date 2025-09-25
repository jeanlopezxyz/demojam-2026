const services = {
  USER_SERVICE: {
    url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    name: 'User Service'
  },
  PRODUCT_SERVICE: {
    url: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002',
    name: 'Product Service'
  },
  ORDER_SERVICE: {
    url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003',
    name: 'Order Service'
  },
  PAYMENT_SERVICE: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3004',
    name: 'Payment Service'
  },
  INVENTORY_SERVICE: {
    url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3005',
    name: 'Inventory Service'
  },
  NOTIFICATION_SERVICE: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
    name: 'Notification Service'
  }
};

module.exports = services;