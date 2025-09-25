require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const sequelize = require('./config/database');
const { connectRedis } = require('./config/redis');
const inventoryRoutes = require('./routes/inventoryRoutes');
const inventoryService = require('./services/inventoryService');
const { InventoryItem, InventoryTransaction, StockReservation } = require('./models');

const app = express();
const PORT = process.env.PORT || 3005;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // limit each IP to 200 requests per windowMs
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/inventory', inventoryRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Inventory Service',
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

// Schedule reservation expiry check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    await inventoryService.expireReservations();
  } catch (error) {
    console.error('Failed to expire reservations:', error);
  }
});

// Schedule low stock check every hour
cron.schedule('0 * * * *', async () => {
  try {
    const lowStockItems = await inventoryService.getLowStockItems();
    if (lowStockItems.length > 0) {
      console.log(`Low stock alert: ${lowStockItems.length} items need restocking`);
      // Could send aggregated notification here
    }
  } catch (error) {
    console.error('Failed to check low stock items:', error);
  }
});

const startServer = async () => {
  try {
    // Connect to databases
    await sequelize.authenticate();
    console.log('PostgreSQL connection established successfully.');
    
    await connectRedis();
    console.log('Redis connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Inventory Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();