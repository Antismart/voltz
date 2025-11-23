import type { AgentContext } from '@xmtp/agent-sdk';
import type { Logger } from 'pino';
import { getAPIClient } from '../utils/api.js';

/**
 * Handle profile query requests
 */
export async function handleProfileQuery(ctx: AgentContext, logger: Logger) {
  try {
    const senderAddress = ctx.message.senderAddress;
    logger.info(`Fetching profile for ${senderAddress}`);

    const api = getAPIClient();
    const profile = await api.getUserProfile(senderAddress);

    if (!profile) {
      await ctx.sendText(
        "I couldn't find your profile. Make sure you've completed your profile setup in the Voltz app! 👤"
      );
      return;
    }

    // Format profile message
    let profileMessage = `👤 **Your Voltz Profile**\\n\\n`;
    profileMessage += `**Name:** ${profile.name || 'Not set'}\\n`;
    
    if (profile.title) {
      profileMessage += `**Title:** ${profile.title}\\n`;
    }
    
    if (profile.company) {
      profileMessage += `**Company:** ${profile.company}\\n`;
    }
    
    if (profile.bio) {
      profileMessage += `\\n**Bio:** ${profile.bio}\\n`;
    }
    
    if (profile.interests && profile.interests.length > 0) {
      profileMessage += `\\n**Interests:** ${profile.interests.join(', ')}\\n`;
    }
    
    if (profile.goals && profile.goals.length > 0) {
      profileMessage += `\\n**Goals:** ${profile.goals.join(', ')}\\n`;
    }
    
    if (profile.reputation !== undefined) {
      profileMessage += `\\n⭐ **Reputation:** ${profile.reputation} points\\n`;
    }
    
    if (profile.eventsAttended !== undefined) {
      profileMessage += `📅 **Events Attended:** ${profile.eventsAttended}\\n`;
    }
    
    if (profile.connectionsCount !== undefined) {
      profileMessage += `🤝 **Connections:** ${profile.connectionsCount}\\n`;
    }

    profileMessage += `\\n💡 Tip: Keep your profile updated to get better matches!`;

    await ctx.sendText(profileMessage);

    // Log activity
    await api.logMessageActivity({
      fromAddress: ctx.client.address,
      toAddress: senderAddress,
      messageType: 'profile',
      timestamp: new Date(),
    });

    logger.info(`✅ Profile sent to ${senderAddress}`);
  } catch (error) {
    logger.error({ error }, 'Failed to send profile');
    await ctx.sendText(
      "Sorry, I couldn't fetch your profile right now. Please try again later."
    );
  }
}
