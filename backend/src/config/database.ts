import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query');
  });
}

prisma.$on('error', (e) => {
  logger.error({ error: e }, 'Database error');
});

prisma.$on('warn', (e) => {
  logger.warn({ warning: e }, 'Database warning');
});

// Connect to database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error({ error }, '❌ Failed to connect to database');
    throw error;
  }
};

// Disconnect from database
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

export default prisma;
