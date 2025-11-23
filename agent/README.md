# Voltz XMTP Agent

AI-powered XMTP messaging bot for the Voltz event networking platform. This agent handles automated messaging, match notifications, event updates, and provides networking assistance to users.

## Features

- 🤖 **Automated Welcome Messages** - Greets new users with personalized messages
- 🎯 **AI-Powered Match Notifications** - Notifies users about their best networking matches
- 📅 **Event Updates** - Sends reminders and updates about upcoming events
- 💬 **Interactive Chat** - Responds to user commands and queries
- 🛡️ **Rate Limiting** - Prevents spam and abuse
- 📊 **Activity Logging** - Tracks all message interactions

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- A wallet with a private key for the agent
- Access to Voltz backend API
- XMTP network access

## Installation

1. **Clone and navigate to agent directory:**
   ```bash
   cd agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Configure your `.env` file:**
   ```env
   XMTP_WALLET_KEY=your_private_key_here
   XMTP_ENV=dev
   XMTP_DB_ENCRYPTION_KEY=your_32_byte_key_here
   API_URL=http://localhost:3001
   LOG_LEVEL=info
   NODE_ENV=development
   ```

   **Generating Keys:**
   - **Wallet Key**: Use a wallet tool or generate a new Ethereum private key
   - **Encryption Key**: Generate a random 32-byte hex string:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

## Usage

### Starting the Agent

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Build TypeScript:**
```bash
npm run build
```

### Testing the Agent

1. **Get the agent's address:**
   When you start the agent, it will log its wallet address. Users can message this address via XMTP.

2. **Send a test message:**
   Use an XMTP-enabled app to send a message to the agent's address.

3. **Available commands:**
   - `help` - Show available commands
   - `matches` - View AI-powered matches
   - `events` - See upcoming events
   - `profile` - Check profile information

## Architecture

```
agent/
├── src/
│   ├── index.ts              # Main agent entry point
│   ├── handlers/             # Message handlers
│   │   ├── welcome.ts        # Welcome message handler
│   │   ├── matches.ts        # Match notification handler
│   │   ├── events.ts         # Event update handler
│   │   ├── help.ts           # Help command handler
│   │   └── profile.ts        # Profile query handler
│   ├── middleware/           # Middleware functions
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── logging.ts        # Logging middleware
│   │   ├── rateLimit.ts      # Rate limiting middleware
│   │   └── filter.ts         # Message filtering middleware
│   └── utils/                # Utility functions
│       ├── api.ts            # Backend API client
│       └── logger.ts         # Logger configuration
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Message Flow

1. **User sends message** → Agent receives via XMTP
2. **Middleware processing:**
   - Logging middleware logs the message
   - Rate limit middleware checks for spam
   - Filter middleware removes self-messages
   - Auth middleware verifies user
3. **Handler routing:**
   - Message content is analyzed
   - Appropriate handler is called
   - Handler fetches data from backend if needed
4. **Response sent** → User receives reply via XMTP

## Handlers

### Welcome Handler
Sends personalized welcome message when user first contacts the agent.

### Match Handler
Fetches and sends AI-powered networking matches from the backend.

### Event Handler
Retrieves and displays user's upcoming events.

### Help Handler
Provides list of available commands and features.

### Profile Handler
Fetches and displays user's profile information.

## Middleware

### Logging Middleware
Logs all incoming and outgoing messages with timestamps and metadata.

### Rate Limit Middleware
Limits users to 10 messages per minute to prevent spam.

### Filter Middleware
Filters out self-messages and empty content.

### Auth Middleware
Verifies user has a profile and adds profile to context.

## Backend Integration

The agent communicates with the Voltz backend API for:
- User profiles
- Match data
- Event information
- Message activity logging

**API Endpoints Used:**
- `GET /api/profile/:address` - Get user profile
- `GET /api/matches/:address` - Get user matches
- `GET /api/events/user/:address` - Get user events
- `POST /api/messages/log` - Log message activity

## Development

### Project Structure
- **handlers/**: Contains all message handling logic
- **middleware/**: Reusable middleware functions
- **utils/**: Helper functions and utilities

### Adding New Handlers

1. Create new handler file in `src/handlers/`:
   ```typescript
   import type { AgentBaseContext } from '@xmtp/agent-sdk';
   import type { Logger } from 'pino';
   
   export async function handleMyFeature(ctx: AgentBaseContext, logger: Logger) {
     // Your handler logic
     await ctx.sendText('Response message');
   }
   ```

2. Import and register in `src/index.ts`:
   ```typescript
   import { handleMyFeature } from './handlers/myFeature.js';
   
   // In setupHandlers():
   this.agent.on('text', async (ctx) => {
     if (text.includes('mycommand')) {
       await handleMyFeature(ctx, this.logger);
     }
   });
   ```

### Adding New Middleware

1. Create middleware file in `src/middleware/`:
   ```typescript
   import type { AgentMiddleware } from '@xmtp/agent-sdk';
   
   export function myMiddleware(): AgentMiddleware {
     return async (ctx, next) => {
       // Pre-processing
       await next();
       // Post-processing
     };
   }
   ```

2. Register in `src/index.ts`:
   ```typescript
   this.agent.use(myMiddleware());
   ```

## Debugging

Enable debug logs:
```env
LOG_LEVEL=debug
```

View all logs:
```bash
npm run dev | tee agent.log
```

## Deployment

### Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t voltz-agent .
   docker run -d --env-file .env voltz-agent
   ```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start dist/index.js --name voltz-agent
pm2 save
pm2 startup
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never commit `.env` file** - Keep your private keys secure
2. **Use environment-specific keys** - Different keys for dev/prod
3. **Rotate keys regularly** - Update wallet and encryption keys periodically
4. **Limit API access** - Use API keys and rate limiting
5. **Monitor logs** - Watch for suspicious activity

## Troubleshooting

### Agent won't start
- Check that all environment variables are set correctly
- Verify wallet key is valid hex format
- Ensure backend API is accessible

### Messages not being received
- Verify agent address in XMTP network
- Check XMTP_ENV matches your setup
- Look for errors in logs

### Rate limit issues
- Adjust RATE_LIMIT_MAX in `middleware/rateLimit.ts`
- Monitor for spam patterns

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [your-repo-url]
- Email: support@voltz.app
- Discord: [your-discord-url]

---

Built with ❤️ using [XMTP Agent SDK](https://github.com/xmtp/agent-sdk-ts)
