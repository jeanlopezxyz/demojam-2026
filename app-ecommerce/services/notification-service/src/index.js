require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/database');
const notificationRoutes = require('./routes/notificationRoutes');
const templateRoutes = require('./routes/templateRoutes');
const notificationController = require('./controllers/notificationController');
const templateService = require('./services/templateService');

const app = express();
const PORT = process.env.PORT || 3006;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Notification Service',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Schedule notification processing every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await notificationController.processScheduledNotifications();
    console.log('Processed scheduled notifications');
  } catch (error) {
    console.error('Failed to process scheduled notifications:', error);
  }
});

// Schedule failed notification retry every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    await notificationController.retryFailedNotifications();
    console.log('Retried failed notifications');
  } catch (error) {
    console.error('Failed to retry notifications:', error);
  }
});

const startServer = async () => {
  try {
    await connectDB();
    
    // Seed default templates
    await templateService.seedDefaultTemplates();
    
    app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();