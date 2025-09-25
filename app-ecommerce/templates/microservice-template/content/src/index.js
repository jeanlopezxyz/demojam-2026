/**
 * ${{ values.name | title }} Service
 * ${{ values.description }}
 * 
 * Enterprise microservice following e-commerce platform patterns
 * Owner: ${{ values.owner }}
 * Database: ${{ values.database }}
 * Port: ${{ values.port }}
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
{% if values.hasRateLimit %}
const rateLimit = require('express-rate-limit');
{% endif %}
{% if values.hasMetrics %}
const promClient = require('prom-client');
{% endif %}

const config = require('./config');
const logger = require('./utils/logger');
{% if values.hasAuth %}
const authMiddleware = require('./middleware/auth');
{% endif %}
{% if values.hasValidation %}
const validationMiddleware = require('./middleware/validation');
{% endif %}
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
{% if values.hasMetrics %}
const metricsMiddleware = require('./middleware/metrics');
{% endif %}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

{% if values.hasRateLimit %}
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
{% endif %}

{% if values.hasMetrics %}
// Metrics middleware
app.use(metricsMiddleware);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});
{% endif %}

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: '${{ values.name }}',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Check database connectivity
    {% if values.database == "postgresql" %}
    const { pool } = require('./config/database');
    await pool.query('SELECT 1');
    {% endif %}
    {% if values.database == "mongodb" %}
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    {% endif %}
    {% if values.hasCache or values.database == "redis-only" %}
    const redis = require('./config/redis');
    await redis.ping();
    {% endif %}
    
    res.status(200).json({
      status: 'ready',
      service: '${{ values.name }}',
      checks: {
        {% if values.database == "postgresql" %}
        database: 'connected',
        {% endif %}
        {% if values.database == "mongodb" %}
        mongodb: 'connected',
        {% endif %}
        {% if values.hasCache or values.database == "redis-only" %}
        redis: 'connected'
        {% endif %}
      }
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not_ready',
      error: error.message
    });
  }
});

// Request logging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});

{% if values.hasAuth %}
// Authentication middleware for protected routes
app.use('/api/', authMiddleware);
{% endif %}

{% if values.hasValidation %}
// Request validation middleware
app.use('/api/', validationMiddleware);
{% endif %}

// API routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || ${{ values.port }};
const server = app.listen(PORT, () => {
  logger.info(`${{ values.name | title }} Service started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;