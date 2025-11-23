/**
 * Voltz XMTP Agent
 * AI-powered messaging bot for event networking
 */

import { Agent } from '@xmtp/agent-sdk';
import dotenv from 'dotenv';

// Import handlers
import { handleWelcome } from './handlers/welcome.js';
import { handleMatchNotification } from './handlers/matches.js';
import { handleEventUpdate } from './handlers/events.js';
import { handleHelp } from './handlers/help.js';
import { handleProfileQuery } from './handlers/profile.js';

// Import middleware
import { authMiddleware } from './middleware/auth.js';
import { loggingMiddleware } from './middleware/logging.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { filterMiddleware } from './middleware/filter.js';

// Import utils
import { initializeLogger } from './utils/logger.js';
import { connectToBackend } from './utils/api.js';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = initializeLogger();

/**
 * Main agent class for Voltz
 */
class VoltzAgent {
  private agent!: Agent;
  private logger: pino.Logger;

  constructor() {
    this.logger = logger;
  }

  /**
   * Initialize the XMTP agent
   */
  async initialize() {
    try {
      this.logger.info('🚀 Initializing Voltz XMTP Agent...');

      // Create agent from environment variables (uses XMTP_WALLET_KEY, XMTP_ENV, XMTP_DB_ENCRYPTION_KEY)
      this.agent = await Agent.createFromEnv();

      this.logger.info(`✅ Agent initialized for address: ${(this.agent as any).wallet?.address}`);

      // Test backend connection
      await connectToBackend();

      // Setup middleware
      this.setupMiddleware();

      // Setup event handlers
      this.setupHandlers();

      // Setup error handling
      this.setupErrorHandling();

      this.logger.info('✅ Voltz Agent setup complete!');
    } catch (error) {
      this.logger.error({ error }, '❌ Failed to initialize agent');
      throw error;
    }
  }

  /**
   * Setup middleware chain
   */
  private setupMiddleware() {
    this.logger.info('⚙️  Setting up middleware...');

    // Logging middleware (runs first)
    this.agent.use(loggingMiddleware(this.logger));

    // Rate limiting
    this.agent.use(rateLimitMiddleware());

    // Filter out self messages and empty content
    this.agent.use(filterMiddleware());

    // Authentication middleware
    this.agent.use(authMiddleware());

    this.logger.info('✅ Middleware configured');
  }

  /**
   * Setup message event handlers
   */
  private setupHandlers() {
    this.logger.info('📨 Setting up message handlers...');

    // Welcome message for new conversations
    this.agent.on('conversationStart', async (ctx) => {
      await handleWelcome(ctx, this.logger);
    });

    // Handle text messages
    this.agent.on('text', async (ctx) => {
      const text = (ctx.message.content as string).toLowerCase().trim();

      // Command routing
      if (text.includes('help') || text === '/help') {
        await handleHelp(ctx, this.logger);
      } else if (text.includes('profile') || text.includes('my profile')) {
        await handleProfileQuery(ctx, this.logger);
      } else if (text.includes('match') || text.includes('matches')) {
        await handleMatchNotification(ctx, this.logger);
      } else if (text.includes('event') || text.includes('events')) {
        await handleEventUpdate(ctx, this.logger);
      } else {
        // General conversation - could be enhanced with AI
        await ctx.sendText(
          "I'm your Voltz event networking assistant! 🚀\\n\\n" +
          "I can help you with:\\n" +
          "• Finding your best matches\\n" +
          "• Event information\\n" +
          "• Profile updates\\n" +
          "• Networking tips\\n\\n" +
          "Type 'help' to see all available commands!"
        );
      }
    });

    // Handle reactions
    this.agent.on('reaction', async (ctx) => {
      this.logger.info(`Received reaction: ${ctx.message.content}`);
    });

    // Agent startup
    this.agent.on('start', () => {
      this.logger.info('🎉 Voltz Agent is now online and ready to help!');
      this.logger.info(`📱 Agent address: ${(this.agent as any).wallet?.address}`);
    });

    this.logger.info('✅ Handlers configured');
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling() {
    this.logger.info('🛡️  Setting up error handling...');

    // Custom error handler
    this.agent.errors.use(async (error, ctx, next) => {
      this.logger.error({ error }, 'Error processing message');

      try {
        await ctx.sendText(
          "Sorry, I encountered an error processing your message. " +
          "Please try again or type 'help' for assistance."
        );
      } catch (sendError) {
        this.logger.error({ sendError }, 'Failed to send error message');
      }

      // Don't propagate the error further
      return;
    });

    // Catch unhandled errors
    this.agent.on('unhandledError', (error) => {
      this.logger.error({ error }, 'Unhandled error');
    });

    this.logger.info('✅ Error handling configured');
  }

  /**
   * Start the agent
   */
  async start() {
    try {
      this.logger.info('▶️  Starting Voltz Agent...');
      await this.agent.start();
    } catch (error) {
      this.logger.error({ error }, '❌ Failed to start agent');
      throw error;
    }
  }

  /**
   * Stop the agent gracefully
   */
  async stop() {
    try {
      this.logger.info('⏸️  Stopping Voltz Agent...');
      await this.agent.stop();
      this.logger.info('✅ Agent stopped successfully');
    } catch (error) {
      this.logger.error({ error }, '❌ Error stopping agent');
      throw error;
    }
  }

  /**
   * Get the agent instance
   */
  getAgent(): Agent {
    return this.agent;
  }
}

// Main execution
async function main() {
  const voltzAgent = new VoltzAgent();

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    logger.info('\\n🛑 Received SIGINT, shutting down gracefully...');
    await voltzAgent.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('\\n🛑 Received SIGTERM, shutting down gracefully...');
    await voltzAgent.stop();
    process.exit(0);
  });

  // Initialize and start
  await voltzAgent.initialize();
  await voltzAgent.start();
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
}

export { VoltzAgent };
export default VoltzAgent;
