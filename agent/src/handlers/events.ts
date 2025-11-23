import type { AgentContext } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';
import { getAPIClient } from '../utils/api.js';

/**
 * Handle event update requests
 */
export async function handleEventUpdate(ctx: AgentContext, logger: Logger) {
  try {
    const senderAddress = ctx.message.senderAddress;
    logger.info(`Fetching events for ${senderAddress}`);

    const api = getAPIClient();
    const events = await api.getUserEvents(senderAddress);

    if (!events || events.length === 0) {
      await ctx.sendText(
        "You don't have any upcoming events yet. " +
        "Browse available events and RSVP to start networking! 🎉"
      );
      return;
    }

    // Format events message
    let eventMessage = "📅 **Your Upcoming Events**\\n\\n";
    
    events.slice(0, 5).forEach((event: any, index: number) => {
      const eventDate = new Date(event.startDate);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      eventMessage += `${index + 1}. **${event.name}**\\n`;
      eventMessage += `   📍 ${event.location || 'Location TBA'}\\n`;
      eventMessage += `   🕐 ${formattedDate} at ${formattedTime}\\n`;
      
      if (event.attendeeCount) {
        eventMessage += `   👥 ${event.attendeeCount} attendees\\n`;
      }
      
      if (event.matchCount) {
        eventMessage += `   ✨ ${event.matchCount} potential matches\\n`;
      }
      
      eventMessage += '\\n';
    });

    eventMessage += "\\nGet ready to network! 🚀";

    await ctx.sendText(eventMessage);

    // Log activity
    await api.logMessageActivity({
      fromAddress: ctx.client.address,
      toAddress: senderAddress,
      messageType: 'events',
      timestamp: new Date(),
    });

    logger.info(`✅ Sent ${events.length} events to ${senderAddress}`);
  } catch (error) {
    logger.error({ error }, 'Failed to send event updates');
    await ctx.sendText(
      "Sorry, I couldn't fetch your events right now. Please try again later."
    );
  }
}
