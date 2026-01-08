import redisClient from '../config/redis.js';
import logger from '../config/logger.js';

class CacheService {
  constructor() {
    this.defaultTTL = 60 * 5; // 5 minutes
    this.longTTL = 60 * 60; // 1 hour
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (!redisClient.isReady()) {
        return null;
      }

      const value = await redisClient.getClient().get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value to cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = null) {
    try {
      if (!redisClient.isReady()) {
        return false;
      }

      const serialized = JSON.stringify(value);
      const expiryTime = ttl || this.defaultTTL;

      await redisClient.getClient().setex(key, expiryTime, serialized);
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      if (!redisClient.isReady()) {
        return false;
      }

      await redisClient.getClient().del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'products:*')
   */
  async delPattern(pattern) {
    try {
      if (!redisClient.isReady()) {
        return false;
      }

      const keys = await redisClient.getClient().keys(pattern);
      if (keys.length > 0) {
        await redisClient.getClient().del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (!redisClient.isReady()) {
        return false;
      }

      await redisClient.getClient().flushdb();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get or set cache with fallback function
   * @param {string} key - Cache key
   * @param {Function} fallbackFn - Function to execute if cache miss
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async getOrSet(key, fallbackFn, ttl = null) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        logger.info(`Cache HIT: ${key}`);
        return cached;
      }

      logger.info(`Cache MISS: ${key}`);
      // Execute fallback function
      const result = await fallbackFn();

      // Store in cache
      await this.set(key, result, ttl);

      return result;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      // On error, just execute fallback
      return await fallbackFn();
    }
  }

  // Specific cache keys helpers
  getCacheKeys() {
    return {
      products: {
        all: (page, limit, filters) => {
          const filterStr = JSON.stringify(filters || {});
          return `products:list:${page}:${limit}:${filterStr}`;
        },
        detail: (productId) => `products:detail:${productId}`,
        featured: () => 'products:featured',
        trending: () => 'products:trending'
      },
      categories: {
        all: () => 'categories:all',
        detail: (categoryId) => `categories:detail:${categoryId}`
      }
    };
  }

  // Invalidation helpers
  async invalidateProducts() {
    await this.delPattern('products:*');
    logger.info('Products cache invalidated');
  }

  async invalidateCategories() {
    await this.delPattern('categories:*');
    logger.info('Categories cache invalidated');
  }
}

export default new CacheService();
