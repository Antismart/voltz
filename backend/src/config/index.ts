import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load environment variables
loadEnv();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  API_URL: z.string().url().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // 0G Chain
  OG_CHAIN_RPC_URL: z.string().url(),
  OG_CHAIN_ID: z.string().transform(Number),
  OG_PRIVATE_KEY: z.string().optional(),

  // Smart Contracts
  PROFILE_CONTRACT_ADDRESS: z.string().optional(),
  EVENT_CONTRACT_ADDRESS: z.string().optional(),
  REPUTATION_CONTRACT_ADDRESS: z.string().optional(),
  ATTESTATION_CONTRACT_ADDRESS: z.string().optional(),

  // 0G Services
  OG_STORAGE_URL: z.string().url(),
  OG_STORAGE_API_KEY: z.string().optional(),
  OG_DA_URL: z.string().url(),
  OG_COMPUTE_URL: z.string().url(),
  OG_COMPUTE_API_KEY: z.string().optional(),

  // Privy
  PRIVY_APP_ID: z.string().optional(),
  PRIVY_APP_SECRET: z.string().optional(),
  PRIVY_VERIFICATION_KEY: z.string().optional(),

  // vlayer
  VLAYER_API_URL: z.string().url(),
  VLAYER_API_KEY: z.string().optional(),

  // Airstack
  AIRSTACK_API_KEY: z.string().optional(),

  // Security
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    console.error(error);
    process.exit(1);
  }
};

export const config = parseEnv();

// Export typed config
export type Config = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isProduction = () => config.NODE_ENV === 'production';
export const isTest = () => config.NODE_ENV === 'test';
