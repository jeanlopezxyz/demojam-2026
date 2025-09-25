const notificationService = require('../services/notificationService');
const Joi = require('joi');

const sendNotificationSchema = Joi.object({
  type: Joi.string().valid(
    'order_created',
    'order_confirmed',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'payment_confirmed',
    'payment_failed',
    'refund_processed',
    'low_stock_alert',
    'welcome_email',
    'password_reset',
    'email_verification',
    'promotional',
    'system_alert'
  ).required(),
  userId: Joi.string().optional(),
  recipient: Joi.object({
    userId: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    name: Joi.string().required()
  }).optional(),
  channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).optional(),
  data: Joi.object().optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  scheduledFor: Joi.date().optional(),
  templateName: Joi.string().optional(),
  templateVersion: Joi.string().optional(),
  orderId: Joi.string().uuid().optional(),
  paymentId: Joi.string().uuid().optional(),
  productId: Joi.string().uuid().optional(),
  source: Joi.string().default('api'),
  tags: Joi.array().items(Joi.string()).optional()
});

const updatePreferencesSchema = Joi.object({
  preferences: Joi.object({
    order_updates: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    payment_updates: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    marketing: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    security: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    }),
    system_alerts: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean()
    })
  }).required(),
  timezone: Joi.string().optional(),
  language: Joi.string().optional(),
  quietHours: Joi.object({
    enabled: Joi.boolean(),
    start: Joi.string(),
    end: Joi.string()
  }).optional()
});

class NotificationController {
  async sendNotification(req, res) {
    try {
      const { error, value } = sendNotificationSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const notification = await notificationService.sendNotification(value);
      
      res.status(201).json({
        success: true,
        message: 'Notification queued successfully',
        data: notification
      });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send notification'
      });
    }
  }
  
  async getNotificationHistory(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type, status } = req.query;
      
      const history = await notificationService.getNotificationHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        status
      });
      
      res.json({
        success: true,
        data: history.notifications,
        pagination: history.pagination
      });
    } catch (error) {
      console.error('Get notification history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve notification history'
      });
    }
  }
  
  async updateNotificationPreferences(req, res) {
    try {
      const { userId } = req.params;
      const { error, value } = updatePreferencesSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }
      
      const preferences = await notificationService.updateNotificationPreferences(userId, value.preferences);
      
      res.json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update notification preferences'
      });
    }
  }
  
  async getNotificationPreferences(req, res) {
    try {
      const { userId } = req.params;
      
      const preferences = await notificationService.getUserPreferences(userId);
      
      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Get preferences error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve notification preferences'
      });
    }
  }
  
  async getNotificationStatistics(req, res) {
    try {
      const { timeframe = '7d' } = req.query;
      
      const stats = await notificationService.getNotificationStatistics(timeframe);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get notification statistics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve notification statistics'
      });
    }
  }
  
  async processScheduledNotifications(req, res) {
    try {
      // This would typically be called by a cron job or queue processor
      // For now, it's exposed as an endpoint for manual processing
      
      const Notification = require('../models/Notification');
      const notifications = await Notification.find({
        status: 'pending',
        scheduledFor: { $lte: new Date() }
      }).limit(100);
      
      const results = [];
      
      for (const notification of notifications) {
        try {
          await notificationService.processNotification(notification._id);
          results.push({ id: notification._id, success: true });
        } catch (error) {
          results.push({ 
            id: notification._id, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${notifications.length} scheduled notifications`,
        data: results
      });
    } catch (error) {
      console.error('Process scheduled notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process scheduled notifications'
      });
    }
  }
  
  async retryFailedNotifications(req, res) {
    try {
      const { hours = 24 } = req.query;
      const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const Notification = require('../models/Notification');
      const failedNotifications = await Notification.find({
        status: 'failed',
        retryCount: { $lt: 3 },
        updatedAt: { $gte: cutoffDate }
      }).limit(50);
      
      const results = [];
      
      for (const notification of failedNotifications) {
        try {
          await notificationService.processNotification(notification._id);
          results.push({ id: notification._id, success: true });
        } catch (error) {
          results.push({ 
            id: notification._id, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      res.json({
        success: true,
        message: `Retried ${failedNotifications.length} failed notifications`,
        data: results
      });
    } catch (error) {
      console.error('Retry failed notifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retry notifications'
      });
    }
  }
  
  async testNotification(req, res) {
    try {
      const testData = {
        type: 'system_alert',
        recipient: {
          userId: 'test-user',
          email: req.body.email || 'test@example.com',
          phone: req.body.phone,
          name: 'Test User'
        },
        channels: req.body.channels || ['email'],
        data: {
          message: 'This is a test notification',
          timestamp: new Date().toISOString()
        },
        source: 'test'
      };
      
      const notification = await notificationService.sendNotification(testData);
      
      res.json({
        success: true,
        message: 'Test notification sent',
        data: notification
      });
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send test notification'
      });
    }
  }
}

module.exports = new NotificationController();