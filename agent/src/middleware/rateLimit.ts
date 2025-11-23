import type { AgentMiddleware } from '@xmtp/agent-sdk';

/**
 * Rate limiting middleware - prevents spam
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// Allow 10 messages per minute per address
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export function rateLimitMiddleware(): AgentMiddleware {
  return async (ctx, next) => {
    const address = ctx.message.senderAddress;
    const now = Date.now();

    let entry = rateLimits.get(address);

    if (!entry || now > entry.resetAt) {
      // Reset or create new entry
      entry = {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      };
      rateLimits.set(address, entry);
    } else if (entry.count >= RATE_LIMIT_MAX) {
      // Rate limit exceeded
      console.warn(`Rate limit exceeded for ${address}`);
      await ctx.sendText(
        "⏱️ You're sending messages too quickly. Please wait a moment and try again."
      );
      return; // Don't call next()
    } else {
      // Increment count
      entry.count++;
    }

    await next();
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [address, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(address);
    }
  }
}, 5 * 60 * 1000);
