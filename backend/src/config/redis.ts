import Redis from 'ioredis';
import { config } from './index.js';
import { logger } from './logger.js';

// Create Redis client
export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

// Redis event handlers
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error({ error }, '❌ Redis error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to Redis');
    throw error;
  }
};

// Disconnect from Redis
export const disconnectRedis = async () => {
  await redis.quit();
  logger.info('Redis disconnected');
};

// Cache helper functions
export const cacheHelpers = {
  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Set cached data with TTL (in seconds)
  async set(key: string, value: unknown, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  // Delete cached data
  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  // Clear all cache
  async clear(): Promise<void> {
    await redis.flushdb();
  },

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },
};

export default redis;
