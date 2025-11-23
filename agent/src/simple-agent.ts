/**
 * Voltz XMTP Agent - Minimal Working Version
 * Using basic XMTP client instead of agent SDK to avoid dependency conflicts
 */

import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
import pino from 'pino';
import { getAPIClient } from './utils/api.js';

// Load environment variables
dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

const api = getAPIClient();

class VoltzAgent {
  private client!: Client;
  private wallet: Wallet;

  constructor() {
    // Create wallet from environment
    const privateKey = process.env.XMTP_WALLET_KEY;
    if (!privateKey) {
      throw new Error('XMTP_WALLET_KEY environment variable is required');
    }
    this.wallet = new Wallet(privateKey);
  }

  async start() {
    try {
      logger.info('🚀 Starting Voltz XMTP Agent...');

      // Initialize XMTP client
      this.client = await Client.create(this.wallet, {
        env: (process.env.XMTP_ENV as 'local' | 'dev' | 'production') || 'dev',
      });

      logger.info(`✅ Agent started! Address: ${this.wallet.address}`);
      logger.info('📱 Users can message this address via XMTP');

      // Listen for new conversations
      for await (const conversation of await this.client.conversations.stream()) {
        logger.info(`💬 New conversation with ${conversation.peerAddress}`);
        this.handleConversation(conversation);
      }

    } catch (error) {
      logger.error({ error }, '❌ Failed to start agent');
      process.exit(1);
    }
  }

  private async handleConversation(conversation: any) {
    // Send welcome message
    await conversation.send(
      `Hey! 👋 Welcome to Voltz!

I'm your AI-powered event networking assistant. I can help you with:

✨ **Find Your Best Matches**
💡 **Networking Tips**  
📅 **Event Updates**
👤 **Profile Info**

Try sending:
• "help" - Show available commands
• "matches" - View your networking matches
• "events" - See upcoming events
• "profile" - Check your profile

Let's make your next event unforgettable! 🚀`
    );

    // Listen for messages in this conversation
    for await (const message of await conversation.streamMessages()) {
      if (message.senderAddress !== this.wallet.address) {
        await this.handleMessage(conversation, message);
      }
    }
  }

  private async handleMessage(conversation: any, message: any) {
    const text = message.content?.toLowerCase()?.trim();
    const senderAddress = message.senderAddress;
    logger.info(`📩 Message from ${senderAddress}: ${text}`);

    let response = '';

    try {
      if (text?.includes('help')) {
        response = `🤖 **Voltz Agent Commands**

**Available Commands:**
• \`matches\` - View your AI-powered matches
• \`events\` - See your upcoming events
• \`profile\` - Check your profile
• \`help\` - Show this message

**Tips for Better Networking:**
💡 Complete your profile to get better matches
🎯 RSVP to events to meet like-minded people
💬 Reach out to your matches before the event

Let me know what you'd like to do! 🚀`;

      } else if (text?.includes('match')) {
        // Fetch real matches from backend
        const matches = await api.getUserMatches(senderAddress);

        if (!matches || matches.length === 0) {
          response = `🎯 **Your Matches**

You don't have any matches yet!

💡 **Get Matched:**
• Complete your profile
• Register for upcoming events
• Check back after registration

Type "events" to see available events! 🚀`;
        } else {
          response = `🎯 **Your Top Matches**\n\n`;
          matches.slice(0, 5).forEach((match: any, index: number) => {
            response += `${index + 1}. **Match #${index + 1}** (${match.score}% match)\n`;
            response += `   ${match.reasoning}\n\n`;
          });
          response += `Reach out and start networking! 🚀`;
        }

        // Log activity
        await api.logMessageActivity({
          fromAddress: this.wallet.address,
          toAddress: senderAddress,
          messageType: 'matches',
          timestamp: new Date(),
        });

      } else if (text?.includes('event')) {
        // Fetch real events from backend
        const events = await api.getUserEvents(senderAddress);

        if (!events || events.length === 0) {
          response = `📅 **Your Events**

You're not registered for any events yet!

💡 **Get Started:**
• Browse upcoming events on the Voltz platform
• Register for events that interest you
• Get matched with other attendees

Visit the platform to find events! 🚀`;
        } else {
          response = `📅 **Your Upcoming Events**\n\n`;
          events.slice(0, 5).forEach((event: any, index: number) => {
            const startDate = new Date(event.startTime).toLocaleDateString();
            response += `${index + 1}. **${event.name}**\n`;
            response += `   📍 ${event.location}\n`;
            response += `   🕐 ${startDate}\n`;
            if (event.description) {
              response += `   📝 ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}\n`;
            }
            response += `\n`;
          });
          response += `Get ready to network! 🚀`;
        }

        // Log activity
        await api.logMessageActivity({
          fromAddress: this.wallet.address,
          toAddress: senderAddress,
          messageType: 'events',
          timestamp: new Date(),
        });

      } else if (text?.includes('profile')) {
        // Fetch real profile from backend
        const profile = await api.getUserProfile(senderAddress);

        if (!profile) {
          response = `👤 **Your Profile**

You don't have a profile yet!

💡 **Create Your Profile:**
• Visit the Voltz platform
• Complete your profile information
• Start getting matched with others

Create your profile to get started! 🚀`;
        } else {
          response = `👤 **Your Voltz Profile**\n\n`;
          if (profile.metadata) {
            response += `**Type:** ${profile.profileType || 'N/A'}\n`;
            response += `**Address:** ${profile.owner?.substring(0, 10)}...${profile.owner?.substring(profile.owner.length - 8)}\n\n`;
            response += `💡 Tip: Keep your profile updated to get better matches!`;
          } else {
            response += `Profile found but metadata is loading...\n\nTry again in a moment! 🚀`;
          }
        }

        // Log activity
        await api.logMessageActivity({
          fromAddress: this.wallet.address,
          toAddress: senderAddress,
          messageType: 'profile',
          timestamp: new Date(),
        });

      } else {
        response = `Thanks for your message! 😊

I'm your Voltz networking assistant. I can help you with:
• Finding matches
• Event information
• Profile management

Type "help" to see all available commands! 🚀`;
      }

      await conversation.send(response);
      logger.info(`📤 Response sent to ${senderAddress}`);
    } catch (error) {
      logger.error({ error }, 'Failed to handle message');
      await conversation.send("Sorry, I encountered an error. Please try again later! 🙏");
    }
  }
}

// Start the agent
async function main() {
  const agent = new VoltzAgent();

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('\\n👋 Agent shutting down...');
    process.exit(0);
  });

  await agent.start();
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});