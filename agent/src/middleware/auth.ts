import type { AgentMiddleware } from '@xmtp/agent-sdk';
import { getAPIClient } from '../utils/api.js';

/**
 * Authentication middleware - verifies user has a profile
 */
export function authMiddleware(): AgentMiddleware {
  return async (ctx, next) => {
    const address = ctx.message.senderAddress;

    // For now, we'll be permissive and just log if profile doesn't exist
    // In the future, you might want to require profile creation
    const api = getAPIClient();
    const profile = await api.getUserProfile(address);

    if (!profile) {
      console.warn(`No profile found for ${address}`);
      // You can choose to block or just warn
      // For now, we'll allow them to proceed
    }

    // Add profile to context for handlers to use
    (ctx as any).userProfile = profile;

    await next();
  };
}
