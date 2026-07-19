import { createClient } from 'redis';
import Redis from 'ioredis';
import { env } from './env';

// 1. Existing Standard Redis Client (For general app cache or session storage)
export const redisClient = createClient({
  url: env.REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('❌ Redis runtime connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis Connected successfully');
});

redisClient.on('reconnecting', () => {
  console.warn('⚠️ Redis connection lost. Attempting to reconnect...');
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: any) {
    console.error(`❌ Failed to connect to Redis: ${error.message}`);
    process.exit(1);
  }
};

// 2. New Dedicated ioredis Connection (Explicitly for BullMQ background workers)
export const bullMqConnection = new Redis(env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null, // Critical flag that stops BullMQ from throwing connection errors
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    console.log(`[BULLMQ REDIS] Reconnecting attempt #${times} in ${delay}ms`);
    return delay;
  },
});

bullMqConnection.on('connect', () => {
  console.log('✅ BullMQ Redis connection established successfully');
});

bullMqConnection.on('error', (err) => {
  console.error('❌ BullMQ Redis broker error encountered:', err.message);
});