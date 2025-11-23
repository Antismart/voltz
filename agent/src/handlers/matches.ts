import type { AgentContext } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';
import { getAPIClient } from '../utils/api.js';

/**
 * Handle match notification requests
 */
export async function handleMatchNotification(ctx: AgentContext, logger: Logger) {
  try {
    const senderAddress = ctx.message.senderAddress;
    logger.info(`Fetching matches for ${senderAddress}`);

    const api = getAPIClient();
    const matches = await api.getUserMatches(senderAddress);

    if (!matches || matches.length === 0) {
      await ctx.sendText(
        "You don't have any new matches yet. " +
        "Make sure to complete your profile and RSVP to events to get matched with other attendees! 🎯"
      );
      return;
    }

    // Format matches message
    let matchMessage = "🎯 **Your Top Matches**\\n\\n";
    
    matches.slice(0, 5).forEach((match: any, index: number) => {
      const score = Math.round(match.score * 100);
      matchMessage += `${index + 1}. **${match.name}** (${score}% match)\\n`;
      matchMessage += `   ${match.title || 'Attendee'} at ${match.company || 'N/A'}\\n`;
      
      if (match.commonInterests && match.commonInterests.length > 0) {
        matchMessage += `   🤝 Common interests: ${match.commonInterests.slice(0, 3).join(', ')}\\n`;
      }
      
      if (match.conversationStarter) {
        matchMessage += `   💡 Ice breaker: "${match.conversationStarter}"\\n`;
      }
      
      matchMessage += '\\n';
    });

    matchMessage += "\\nReach out and start networking! 🚀";

    await ctx.sendText(matchMessage);

    // Log activity
    await api.logMessageActivity({
      fromAddress: ctx.client.address,
      toAddress: senderAddress,
      messageType: 'matches',
      timestamp: new Date(),
    });

    logger.info(`✅ Sent ${matches.length} matches to ${senderAddress}`);
  } catch (error) {
    logger.error({ error }, 'Failed to send match notifications');
    await ctx.sendText(
      "Sorry, I couldn't fetch your matches right now. Please try again later."
    );
  }
}
