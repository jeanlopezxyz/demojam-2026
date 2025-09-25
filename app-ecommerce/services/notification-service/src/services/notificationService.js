const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const NotificationPreference = require('../models/NotificationPreference');
const emailService = require('./emailService');
const smsService = require('./smsService');
const templateService = require('./templateService');
const axios = require('axios');

class NotificationService {
  async sendNotification(notificationData) {
    try {
      // Get user details if not provided
      let recipient = notificationData.recipient;
      if (!recipient && notificationData.userId) {
        recipient = await this.getUserDetails(notificationData.userId);
      }
      
      if (!recipient) {
        throw new Error('Recipient information is required');
      }
      
      // Get user preferences
      const preferences = await this.getUserPreferences(recipient.userId);
      
      // Determine channels based on preferences and notification type
      const channels = this.determineChannels(notificationData.type, preferences, notificationData.channels);
      
      if (channels.length === 0) {
        console.log(`User ${recipient.userId} has disabled all channels for ${notificationData.type}`);
        return null;
      }
      
      // Create notification record
      const notification = new Notification({
        type: notificationData.type,
        recipient,
        channels,
        template: {
          name: notificationData.templateName || this.getDefaultTemplateName(notificationData.type),
          version: notificationData.templateVersion || '1.0'
        },
        data: notificationData.data || {},
        priority: notificationData.priority || 'normal',
        scheduledFor: notificationData.scheduledFor,
        metadata: {
          orderId: notificationData.orderId,
          paymentId: notificationData.paymentId,
          productId: notificationData.productId,
          source: notificationData.source || 'system',
          tags: notificationData.tags || []
        }
      });
      
      await notification.save();
      
      // Process notification immediately if not scheduled
      if (!notificationData.scheduledFor || new Date(notificationData.scheduledFor) <= new Date()) {
        await this.processNotification(notification._id);
      }
      
      return notification;
      
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }
  
  async processNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      
      if (!notification || notification.status !== 'pending') {
        return;
      }
      
      // Update status to processing
      notification.status = 'processing';
      await notification.save();
      
      // Get template for each channel
      const results = {};
      let hasSuccess = false;
      let hasFailure = false;
      
      for (const channel of notification.channels) {
        try {
          const template = await NotificationTemplate.findOne({
            type: notification.type,
            channel,
            isActive: true
          });
          
          if (!template) {
            console.warn(`No template found for ${notification.type}/${channel}`);
            continue;
          }
          
          // Render template with data
          const renderedContent = await templateService.renderTemplate(template, notification.data);
          
          // Send via appropriate channel
          let result;
          switch (channel) {
            case 'email':
              result = await emailService.sendEmail({
                to: notification.recipient.email,
                subject: renderedContent.subject,
                html: renderedContent.html,
                text: renderedContent.text
              });
              notification.delivery.email = {
                status: result.success ? 'sent' : 'failed',
                sentAt: new Date(),
                messageId: result.messageId,
                error: result.error
              };
              break;
              
            case 'sms':
              if (notification.recipient.phone) {
                result = await smsService.sendSMS({
                  to: notification.recipient.phone,
                  body: renderedContent.text
                });
                notification.delivery.sms = {
                  status: result.success ? 'sent' : 'failed',
                  sentAt: new Date(),
                  messageId: result.messageId,
                  error: result.error
                };
              } else {
                console.warn(`No phone number for user ${notification.recipient.userId}`);
                continue;
              }
              break;
              
            case 'push':
              // Push notification implementation would go here
              console.log('Push notifications not implemented yet');
              continue;
              
            default:
              console.warn(`Unsupported channel: ${channel}`);
              continue;
          }
          
          results[channel] = result;
          
          if (result.success) {
            hasSuccess = true;
          } else {
            hasFailure = true;
          }
          
        } catch (channelError) {
          console.error(`Error sending ${channel} notification:`, channelError);
          hasFailure = true;
          
          // Update delivery status for failed channel
          if (channel === 'email') {
            notification.delivery.email = {
              status: 'failed',
              error: channelError.message
            };
          } else if (channel === 'sms') {
            notification.delivery.sms = {
              status: 'failed',
              error: channelError.message
            };
          }
        }
      }
      
      // Update notification status
      if (hasSuccess && !hasFailure) {
        notification.status = 'sent';
        notification.sentAt = new Date();
      } else if (hasSuccess && hasFailure) {
        notification.status = 'sent'; // Partial success
        notification.sentAt = new Date();
      } else {
        notification.status = 'failed';
        notification.retryCount += 1;
      }
      
      await notification.save();
      
      // Schedule retry if failed and under retry limit
      if (notification.status === 'failed' && notification.retryCount < notification.maxRetries) {
        // In a real implementation, you would schedule this with a job queue
        setTimeout(() => {
          this.processNotification(notificationId);
        }, 300000); // Retry after 5 minutes
      }
      
      return results;
      
    } catch (error) {
      console.error('Process notification error:', error);
      
      // Update notification status to failed
      await Notification.findByIdAndUpdate(notificationId, {
        status: 'failed',
        $inc: { retryCount: 1 }
      });
      
      throw error;
    }
  }
  
  async getUserDetails(userId) {
    try {
      const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/users/${userId}`);
      const user = response.data.data;
      
      return {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        name: `${user.firstName} ${user.lastName}`
      };
    } catch (error) {
      console.error('Failed to get user details:', error);
      return null;
    }
  }
  
  async getUserPreferences(userId) {
    let preferences = await NotificationPreference.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences
      preferences = new NotificationPreference({
        userId,
        email: '', // Will be updated when user details are fetched
        preferences: {
          order_updates: { email: true, sms: false, push: true },
          payment_updates: { email: true, sms: false, push: true },
          marketing: { email: true, sms: false, push: false },
          security: { email: true, sms: true, push: true },
          system_alerts: { email: true, sms: false, push: true }
        }
      });
      
      await preferences.save();
    }
    
    return preferences;
  }
  
  determineChannels(notificationType, preferences, requestedChannels = []) {
    if (!preferences) {
      return requestedChannels.length > 0 ? requestedChannels : ['email'];
    }
    
    const typeMapping = {
      order_created: 'order_updates',
      order_confirmed: 'order_updates',
      order_shipped: 'order_updates',
      order_delivered: 'order_updates',
      order_cancelled: 'order_updates',
      payment_confirmed: 'payment_updates',
      payment_failed: 'payment_updates',
      refund_processed: 'payment_updates',
      promotional: 'marketing',
      password_reset: 'security',
      email_verification: 'security',
      low_stock_alert: 'system_alerts',
      system_alert: 'system_alerts'
    };
    
    const preferenceKey = typeMapping[notificationType] || 'system_alerts';
    const userPrefs = preferences.preferences[preferenceKey] || {};
    
    const enabledChannels = [];
    
    // Check each channel against user preferences
    const channelsToCheck = requestedChannels.length > 0 ? requestedChannels : ['email', 'sms', 'push'];
    
    for (const channel of channelsToCheck) {
      if (userPrefs[channel] === true) {
        enabledChannels.push(channel);
      }
    }
    
    // Always allow security notifications via email
    if (['password_reset', 'email_verification'].includes(notificationType) && !enabledChannels.includes('email')) {
      enabledChannels.push('email');
    }
    
    return enabledChannels;
  }
  
  getDefaultTemplateName(notificationType) {
    const templateNames = {
      order_created: 'order-confirmation',
      order_confirmed: 'order-confirmed',
      order_shipped: 'order-shipped',
      order_delivered: 'order-delivered',
      order_cancelled: 'order-cancelled',
      payment_confirmed: 'payment-confirmed',
      payment_failed: 'payment-failed',
      refund_processed: 'refund-processed',
      low_stock_alert: 'low-stock-alert',
      welcome_email: 'welcome',
      password_reset: 'password-reset',
      email_verification: 'email-verification',
      promotional: 'promotional',
      system_alert: 'system-alert'
    };
    
    return templateNames[notificationType] || 'default';
  }
  
  async getNotificationHistory(userId, options = {}) {
    const { page = 1, limit = 20, type, status } = options;
    const skip = (page - 1) * limit;
    
    const query = { 'recipient.userId': userId };
    if (type) query.type = type;
    if (status) query.status = status;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments(query);
    
    return {
      notifications,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }
  
  async updateNotificationPreferences(userId, preferences) {
    const existingPrefs = await NotificationPreference.findOne({ userId });
    
    if (existingPrefs) {
      Object.assign(existingPrefs.preferences, preferences);
      await existingPrefs.save();
      return existingPrefs;
    } else {
      const newPrefs = new NotificationPreference({
        userId,
        preferences
      });
      await newPrefs.save();
      return newPrefs;
    }
  }
  
  async getNotificationStatistics(timeframe = '7d') {
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    const stats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    return {
      timeframe,
      statusBreakdown: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      typeBreakdown: typeStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  }
}

module.exports = new NotificationService();