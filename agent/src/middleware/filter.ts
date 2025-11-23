import type { AgentMiddleware } from '@xmtp/agent-sdk';
import { filter as f } from '@xmtp/agent-sdk';

/**
 * Filter middleware - filters out unwanted messages
 */
export function filterMiddleware(): AgentMiddleware {
  return async (ctx, next) => {
    // Don't process messages from self
    if (f.fromSelf(ctx.message, ctx.client)) {
      return;
    }

    // Don't process empty messages
    if (!ctx.message.content || ctx.message.content === '') {
      return;
    }

    await next();
  };
}
