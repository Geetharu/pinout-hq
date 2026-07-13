import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string(), // Removed .url() so multi-host shard links pass cleanly
  REDIS_URL: z.string(), // Removed .url() so Upstash rediss:// protocol passes cleanly
  API_SECRET_KEY: z.string().min(16, "API Secret Key must be at least 16 characters for security")
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;