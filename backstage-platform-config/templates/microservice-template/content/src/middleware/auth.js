/**
 * JWT Authentication Middleware
 * Enterprise-grade authentication with proper error handling
 */

{% if values.hasAuth %}
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');
{% if values.hasCache %}
const redis = require('../config/redis');
{% endif %}

/**
 * Extract token from Authorization header
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Verify JWT token and add user context to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'Authorization token required'
        }
      });
    }
    
    {% if values.hasCache %}
    // Check token blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      logger.logSecurityEvent('BLACKLISTED_TOKEN_USED', { token: token.substring(0, 10) + '...' });
      return res.status(401).json({
        error: {
          code: 'TOKEN_BLACKLISTED',
          message: 'Token has been invalidated'
        }
      });
    }
    {% endif %}
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.security.jwtSecret);
    
    // Add user context to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
      tokenId: decoded.jti
    };
    
    req.auth = {
      token,
      issuedAt: decoded.iat,
      expiresAt: decoded.exp,
      subject: decoded.sub
    };
    
    // Log successful authentication
    logger.info('Authentication successful', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      endpoint: req.path
    });
    
    next();
    
  } catch (error) {
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Invalid authentication token';
    
    if (error.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Authentication token has expired';
      logger.logSecurityEvent('EXPIRED_TOKEN_USED', { 
        expiredAt: error.expiredAt,
        path: req.path 
      });
    } else if (error.name === 'JsonWebTokenError') {
      errorCode = 'MALFORMED_TOKEN';
      errorMessage = 'Malformed authentication token';
      logger.logSecurityEvent('MALFORMED_TOKEN_USED', { 
        error: error.message,
        path: req.path 
      });
    } else {
      logger.error('Authentication error:', error);
    }
    
    return res.status(401).json({
      error: {
        code: errorCode,
        message: errorMessage
      }
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (requiredRoles = [], requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      const { user } = req;
      
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required for this endpoint'
          }
        });
      }
      
      // Check role requirements
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.includes(user.role) || user.role === 'admin';
        
        if (!hasRequiredRole) {
          logger.logSecurityEvent('INSUFFICIENT_ROLE', {
            userId: user.id,
            userRole: user.role,
            requiredRoles,
            path: req.path
          });
          
          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_ROLE',
              message: 'Insufficient role permissions'
            }
          });
        }
      }
      
      // Check permission requirements
      if (requiredPermissions.length > 0) {
        const hasRequiredPermissions = requiredPermissions.every(
          permission => user.permissions.includes(permission)
        );
        
        if (!hasRequiredPermissions && user.role !== 'admin') {
          logger.logSecurityEvent('INSUFFICIENT_PERMISSIONS', {
            userId: user.id,
            userPermissions: user.permissions,
            requiredPermissions,
            path: req.path
          });
          
          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'Insufficient permissions'
            }
          });
        }
      }
      
      next();
      
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Authorization check failed'
        }
      });
    }
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = jwt.verify(token, config.security.jwtSecret);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      };
    }
    
    next();
    
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  authorize,
  optionalAuth,
  extractToken
};
{% else %}
// Authentication disabled for this service
module.exports = {
  authMiddleware: (req, res, next) => next(),
  authorize: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => next()
};
{% endif %}