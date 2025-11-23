import Bull from 'bull';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

// Create queues
export const matchQueue = new Bull('match-generation', config.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const syncQueue = new Bull('event-sync', config.REDIS_URL, {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  },
});

// Queue event handlers
matchQueue.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Match generation completed');
});

matchQueue.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, error }, 'Match generation failed');
});

syncQueue.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'Event sync completed');
});

logger.info('✅ Job queues initialized');
