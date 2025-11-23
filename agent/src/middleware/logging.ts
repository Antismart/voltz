import type { AgentMiddleware } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';

/**
 * Logging middleware - logs all incoming and outgoing messages
 */
export function loggingMiddleware(logger: Logger): AgentMiddleware {
  return async (ctx, next) => {
    const startTime = Date.now();
    
    logger.info({
      type: 'message_received',
      from: ctx.message.senderAddress,
      conversationId: ctx.message.conversationId,
      contentType: ctx.message.contentType,
    }, 'Incoming message');

    await next();

    const duration = Date.now() - startTime;
    logger.info({
      type: 'message_processed',
      duration,
      from: ctx.message.senderAddress,
    }, `Message processed in ${duration}ms`);
  };
}
