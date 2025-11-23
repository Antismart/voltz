import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

// Create Fastify instance
const server = Fastify({
  logger: {
    level: config.LOG_LEVEL || 'info',
    transport:
      config.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
  requestIdLogLabel: 'reqId',
  disableRequestLogging: false,
  trustProxy: true,
});

// Register plugins
await server.register(cors, {
  origin: config.CORS_ORIGIN,
  credentials: true,
});

await server.register(helmet, {
  contentSecurityPolicy: false, // Disable for API
});

await server.register(rateLimit, {
  max: config.RATE_LIMIT_MAX,
  timeWindow: config.RATE_LIMIT_WINDOW_MS,
  redis: (await import('./config/redis.js')).redis,
});

await server.register(websocket);

// Health check route
server.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  };
});

// API info route
server.get('/', async (request, reply) => {
  return {
    name: 'Voltz Backend API',
    version: '1.0.0',
    description: 'AI-Powered Event Networking Platform on 0G Infrastructure',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  };
});

// API routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import eventRoutes from './routes/event.routes.js';
import matchRoutes from './routes/match.routes.js';
import agentRoutes from './routes/agent.routes.js';

await server.register(authRoutes, { prefix: '/api/v1/auth' });
await server.register(profileRoutes, { prefix: '/api/v1/profiles' });
await server.register(eventRoutes, { prefix: '/api/v1/events' });
await server.register(matchRoutes, { prefix: '/api/v1/matches' });
await server.register(agentRoutes, { prefix: '/api/v1/agent' });

// Global error handler
server.setErrorHandler((error, request, reply) => {
  logger.error({ error, request: request.url }, 'Request error');

  // Don't leak error details in production
  const isDev = config.NODE_ENV === 'development';

  reply.status(error.statusCode || 500).send({
    error: {
      message: error.message,
      statusCode: error.statusCode || 500,
      ...(isDev && { stack: error.stack }),
    },
  });
});

// Not found handler
server.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: request.url,
    },
  });
});

// Graceful shutdown handler
const closeGracefully = async (signal: string) => {
  logger.info(`Received ${signal}, closing gracefully...`);

  try {
    await server.close();
    await disconnectDatabase();
    await disconnectRedis();
    logger.info('✅ Server closed gracefully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, '❌ Error during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start server
const start = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Start server
    await server.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    logger.info(`
    ⚡ Voltz Backend API Started
    🌐 Server: ${config.API_URL}
    📊 Environment: ${config.NODE_ENV}
    🔗 0G Chain: ${config.OG_CHAIN_RPC_URL}
    `);
  } catch (error) {
    logger.error({ error }, '❌ Failed to start server');
    process.exit(1);
  }
};

start();

export { server };
