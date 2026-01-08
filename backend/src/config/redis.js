import Redis from 'ioredis';
import logger from './logger.js';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.errorLogged = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => {
          // Stop retrying after 3 attempts
          if (times > 3) {
            logger.warn('⚠️ Redis connection failed after 3 attempts, giving up');
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        enableOfflineQueue: false, // Don't queue commands when offline
        connectTimeout: 5000, // 5 second timeout
        showFriendlyErrorStack: false
      });

      // Add error handler BEFORE connecting to prevent unhandled errors
      this.client.on('error', (err) => {
        // Only log once, not spam
        if (this.isConnected || !this.errorLogged) {
          logger.error('❌ Redis error:', err.message);
          this.errorLogged = true;
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
        this.isConnected = true;
        this.errorLogged = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('🔄 Redis reconnecting...');
      });

      await this.client.connect();

      return this.client;
    } catch (error) {
      logger.warn('⚠️ Redis not available:', error.message);
      logger.info('ℹ️ App will continue without Redis (no caching/queue)');
      // Don't throw error, allow app to continue without Redis
      this.isConnected = false;
      
      // Clean up client if connection failed
      if (this.client) {
        this.client.disconnect(false);
        this.client = null;
      }
      
      return null;
    }
  }

  getClient() {
    return this.client;
  }

  isReady() {
    return this.isConnected && this.client && this.client.status === 'ready';
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }
}

export default new RedisClient();
