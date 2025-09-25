const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: [
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
    ]
  },
  channel: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'push', 'in_app']
  },
  version: {
    type: String,
    default: '1.0'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subject: {
    type: String,
    required: function() {
      return this.channel === 'email';
    }
  },
  content: {
    html: {
      type: String,
      required: function() {
        return this.channel === 'email';
      }
    },
    text: {
      type: String,
      required: true
    },
    variables: [{
      name: String,
      description: String,
      required: Boolean,
      defaultValue: String
    }]
  },
  settings: {
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    retryCount: {
      type: Number,
      default: 3
    },
    delayBetweenRetries: {
      type: Number,
      default: 300 // seconds
    }
  },
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
notificationTemplateSchema.index({ name: 1, version: 1 }, { unique: true });
notificationTemplateSchema.index({ type: 1 });
notificationTemplateSchema.index({ channel: 1 });
notificationTemplateSchema.index({ isActive: 1 });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);