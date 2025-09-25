const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Send notification
router.post('/send', notificationController.sendNotification);

// Test notification
router.post('/test', notificationController.testNotification);

// User notification history
router.get('/user/:userId/history', notificationController.getNotificationHistory);

// User notification preferences
router.get('/user/:userId/preferences', notificationController.getNotificationPreferences);
router.put('/user/:userId/preferences', notificationController.updateNotificationPreferences);

// Admin operations
router.get('/admin/statistics', notificationController.getNotificationStatistics);
router.post('/admin/process-scheduled', notificationController.processScheduledNotifications);
router.post('/admin/retry-failed', notificationController.retryFailedNotifications);

module.exports = router;