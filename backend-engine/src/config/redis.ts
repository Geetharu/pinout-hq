import { createClient } from 'redis';
import { env } from './env';

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