/**
 * Configuration management for ${{ values.name }}
 * Centralized configuration with environment variable validation
 */

require('dotenv').config();

const config = {
  // Service configuration
  service: {
    name: '${{ values.name }}',
    version: process.env.APP_VERSION || '1.0.0',
    port: process.env.PORT || ${{ values.port }},
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  },
  
  {% if values.database == "postgresql" %}
  // PostgreSQL configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || '${{ values.name | replace("-", "_") }}',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    logging: process.env.DB_LOGGING === 'true' ? console.log : false
  },
  {% endif %}
  
  {% if values.database == "mongodb" %}
  // MongoDB configuration
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/${{ values.name | replace("-", "_") }}',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT) || 5000,
      retryWrites: true,
      w: 'majority'
    }
  },
  {% endif %}
  
  {% if values.hasCache or values.database == "redis-only" %}
  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  },
  {% endif %}
  
  // External services
  services: {
    userService: process.env.USER_SERVICE_URL || 'http://user-service:3001',
    productService: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
    orderService: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
    paymentService: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
    inventoryService: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3005',
    notificationService: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // requests per window
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    timestamp: true,
    colorize: process.env.NODE_ENV !== 'production'
  },
  
  {% if values.hasMetrics %}
  // Metrics configuration
  metrics: {
    prefix: '${{ values.name | replace("-", "_") }}_',
    defaultLabels: {
      service: '${{ values.name }}',
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  },
  {% endif %}
  
  // Business configuration
  business: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 20,
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000 // 30 seconds
  }
};

// Configuration validation
const validateConfig = () => {
  const required = [];
  
  {% if values.database == "postgresql" %}
  if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
    required.push('DB_PASSWORD');
  }
  {% endif %}
  
  {% if values.database == "mongodb" %}
  if (!process.env.MONGODB_URL && process.env.NODE_ENV === 'production') {
    required.push('MONGODB_URL');
  }
  {% endif %}
  
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    required.push('JWT_SECRET');
  }
  
  if (required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(', ')}`);
  }
};

// Validate configuration on startup
validateConfig();

module.exports = config;