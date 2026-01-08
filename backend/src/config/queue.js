import { Queue, Worker } from 'bullmq';
import redisClient from './redis.js';
import logger from './logger.js';

class QueueManager {
  constructor() {
    this.queues = {};
    this.workers = {};
    this.connection = null;
  }

  async initialize() {
    try {
      // Wait for Redis to be ready
      if (!redisClient.isReady()) {
        logger.warn('Redis not ready, queues will not be initialized');
        return;
      }

      // Get Redis connection for BullMQ
      this.connection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      };

      // If REDIS_URL is provided, parse it
      if (process.env.REDIS_URL) {
        const url = new URL(process.env.REDIS_URL);
        this.connection.host = url.hostname;
        this.connection.port = parseInt(url.port) || 6379;
        if (url.password) {
          this.connection.password = url.password;
        }
      }

      // Create queues
      this.queues.emailQueue = new Queue('email-queue', { connection: this.connection });
      this.queues.imageQueue = new Queue('image-queue', { connection: this.connection });

      logger.info('✅ Queue system initialized');
    } catch (error) {
      logger.error('Failed to initialize queue system:', error);
      // Don't throw, allow app to continue without queues
    }
  }

  /**
   * Add email job to queue
   * @param {string} type - Email type (order-success, order-cancelled, etc.)
   * @param {Object} data - Email data
   */
  async addEmailJob(type, data) {
    try {
      if (!this.queues.emailQueue) {
        logger.warn('Email queue not initialized, skipping job');
        return null;
      }

      const job = await this.queues.emailQueue.add(
        type,
        data,
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      );

      logger.info(`Email job added: ${job.id} - Type: ${type}`);
      return job;
    } catch (error) {
      logger.error('Failed to add email job:', error);
      return null;
    }
  }

  /**
   * Add image processing job to queue
   * @param {Object} data - Image processing data
   */
  async addImageJob(data) {
    try {
      if (!this.queues.imageQueue) {
        logger.warn('Image queue not initialized, skipping job');
        return null;
      }

      const job = await this.queues.imageQueue.add(
        'process-custom-design',
        data,
        {
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 5000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      );

      logger.info(`Image processing job added: ${job.id}`);
      return job;
    } catch (error) {
      logger.error('Failed to add image job:', error);
      return null;
    }
  }

  /**
   * Register email worker
   */
  registerEmailWorker(processorFn) {
    try {
      if (!this.connection) {
        logger.warn('Queue connection not initialized, skipping worker registration');
        return;
      }

      this.workers.emailWorker = new Worker(
        'email-queue',
        processorFn,
        { connection: this.connection }
      );

      this.workers.emailWorker.on('completed', (job) => {
        logger.info(`Email job completed: ${job.id}`);
      });

      this.workers.emailWorker.on('failed', (job, err) => {
        logger.error(`Email job failed: ${job.id}`, err);
      });

      logger.info('✅ Email worker registered');
    } catch (error) {
      logger.error('Failed to register email worker:', error);
    }
  }

  /**
   * Register image worker
   */
  registerImageWorker(processorFn) {
    try {
      if (!this.connection) {
        logger.warn('Queue connection not initialized, skipping worker registration');
        return;
      }

      this.workers.imageWorker = new Worker(
        'image-queue',
        processorFn,
        { connection: this.connection }
      );

      this.workers.imageWorker.on('completed', (job) => {
        logger.info(`Image job completed: ${job.id}`);
      });

      this.workers.imageWorker.on('failed', (job, err) => {
        logger.error(`Image job failed: ${job.id}`, err);
      });

      logger.info('✅ Image worker registered');
    } catch (error) {
      logger.error('Failed to register image worker:', error);
    }
  }

  async closeAll() {
    try {
      // Close all workers
      for (const worker of Object.values(this.workers)) {
        await worker.close();
      }

      // Close all queues
      for (const queue of Object.values(this.queues)) {
        await queue.close();
      }

      logger.info('All queues and workers closed');
    } catch (error) {
      logger.error('Error closing queues:', error);
    }
  }
}

export default new QueueManager();
