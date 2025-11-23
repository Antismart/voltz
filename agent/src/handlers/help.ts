import type { AgentContext } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';

/**
 * Send help message with available commands
 */
export async function handleHelp(ctx: AgentContext, logger: Logger) {
  try {
    const senderAddress = ctx.message.senderAddress;
    logger.info(`Sending help message to ${senderAddress}`);

    const helpMessage = `
🤖 **Voltz Agent Commands**

I can help you with the following:

**Networking:**
• \`matches\` - View your AI-powered matches
• \`profile\` - Check your profile information
• \`events\` - See your upcoming events

**Information:**
• \`help\` - Show this help message

**Tips for Better Networking:**
💡 Complete your profile to get better matches
🎯 RSVP to events to meet like-minded people
💬 Reach out to your matches before the event
⭐ Build your reputation by attending events

**Need More Help?**
Visit our website or reach out to our support team.

Let me know what you'd like to do! 🚀
    `.trim();

    await ctx.sendText(helpMessage);

    logger.info(`✅ Help message sent to ${senderAddress}`);
  } catch (error) {
    logger.error({ error }, 'Failed to send help message');
  }
}
