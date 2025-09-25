/**
 * Enterprise logging configuration
 * Structured logging with correlation IDs and request tracking
 */

const winston = require('winston');
const config = require('../config');

// Custom log format for production
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      service: '${{ values.name }}',
      message,
      ...meta
    });
  })
);

// Human-readable format for development
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${timestamp} [${level}] [${{ values.name }}]: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: config.service.environment === 'production' ? productionFormat : developmentFormat,
  defaultMeta: {
    service: '${{ values.name }}',
    version: config.service.version,
    environment: config.service.environment
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: config.service.environment === 'production' ? productionFormat : developmentFormat
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.Console()
  ],
  
  // Exit on handled exceptions
  exitOnError: false
});

// Add file logging for production
if (config.service.environment === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: productionFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Add correlation ID to logs
logger.addCorrelationId = (correlationId) => {
  return logger.child({ correlationId });
};

// Business event logging
logger.logBusinessEvent = (event, data) => {
  logger.info('Business Event', {
    eventType: event,
    eventData: data,
    businessEvent: true
  });
};

// Security event logging
logger.logSecurityEvent = (event, data) => {
  logger.warn('Security Event', {
    eventType: event,
    eventData: data,
    securityEvent: true
  });
};

// Performance logging
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance Metric', {
    operation,
    duration,
    ...metadata,
    performanceEvent: true
  });
};

module.exports = logger;