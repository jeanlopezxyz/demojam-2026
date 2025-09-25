const jwt = require('jsonwebtoken');
const axios = require('axios');
const services = require('../config/services');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    try {
      const response = await axios.get(`${services.USER_SERVICE.url}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found.'
        });
      }
      
      req.user = decoded;
      req.userData = response.data.data;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user service unavailable.'
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};