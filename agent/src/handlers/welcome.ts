import type { AgentContext } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';
import { getAPIClient } from '../utils/api.js';

/**
 * Send welcome message to new conversations
 */
export async function handleWelcome(ctx: AgentContext, logger: Logger) {
  try {
    const senderAddress = ctx.message.senderAddress;
    logger.info(`Sending welcome message to ${senderAddress}`);

    // Fetch user profile to personalize greeting
    const api = getAPIClient();
    const profile = await api.getUserProfile(senderAddress);

    const userName = profile?.name || 'there';

    const welcomeMessage = `
Hey ${userName}! 👋 Welcome to Voltz!

I'm your AI-powered event networking assistant. I'm here to help you:

✨ **Find Your Best Matches**
I'll notify you about attendees with similar interests and goals

🎯 **Event Updates**
Get real-time updates about events you're attending

💡 **Networking Tips**
Get AI-powered conversation starters and connection suggestions

📊 **Track Your Network**
View your reputation and connections

**Quick Commands:**
• \`matches\` - See your latest matches
• \`events\` - View your upcoming events  
• \`profile\` - Check your profile
• \`help\` - See all available commands

Let's make your next event unforgettable! 🚀
    `.trim();

    await ctx.sendText(welcomeMessage);

    // Log activity
    await api.logMessageActivity({
      fromAddress: ctx.client.address,
      toAddress: senderAddress,
      messageType: 'welcome',
      timestamp: new Date(),
    });

    logger.info(`✅ Welcome message sent to ${senderAddress}`);
  } catch (error) {
    logger.error({ error }, 'Failed to send welcome message');
  }
}
