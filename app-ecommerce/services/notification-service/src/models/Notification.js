const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => require('uuid').v4(),
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
  recipient: {
    userId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    name: {
      type: String,
      required: true
    }
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  }],
  template: {
    name: {
      type: String,
      required: true
    },
    version: {
      type: String,
      default: '1.0'
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending'
  },
  delivery: {
    email: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced']
      },
      sentAt: Date,
      deliveredAt: Date,
      error: String,
      messageId: String
    },
    sms: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      },
      sentAt: Date,
      deliveredAt: Date,
      error: String,
      messageId: String
    },
    push: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      },
      sentAt: Date,
      deliveredAt: Date,
      error: String,
      messageId: String
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  metadata: {
    orderId: String,
    paymentId: String,
    productId: String,
    source: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ 'recipient.userId': 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ 'metadata.orderId': 1 });

module.exports = mongoose.model('Notification', notificationSchema);