import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Load environment variables FIRST
dotenv.config();

import connectDB from './config/database.js';
import redisClient from './config/redis.js';
import queueManager from './config/queue.js';
import logger from './config/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import CronJobs from './services/cron.service.js';
import emailProcessor from './workers/email.worker.js';
import imageProcessor from './workers/image.worker.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import mailService from './services/mail.service.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize infrastructure
async function initializeInfrastructure() {
  try {
    // Connect to Database
    await connectDB();

    // Connect to Redis (optional, app continues if Redis fails)
    await redisClient.connect();

    // Initialize Queue Manager (depends on Redis)
    await queueManager.initialize();

    // Register queue workers if queues are available
    if (queueManager.queues.emailQueue) {
      queueManager.registerEmailWorker(emailProcessor);
      queueManager.registerImageWorker(imageProcessor);
    }

    // Initialize Cron Jobs
    CronJobs.initialize();

    logger.info('✅ All infrastructure initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize infrastructure:', error);
    // Don't exit, allow app to continue with reduced functionality
  }
}

// Call initialization
initializeInfrastructure();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable CSP for uploads
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api', reviewRoutes);
app.use('/api', notificationRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await queueManager.closeAll();
  await redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await queueManager.closeAll();
  await redisClient.disconnect();
  process.exit(0);
});

export default app;
