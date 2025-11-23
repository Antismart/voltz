# Voltz Backend API

AI-Powered Event Networking Platform - Backend Service

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OG_CHAIN_RPC_URL` - 0G Chain RPC URL
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `SESSION_SECRET` - Secret for sessions (min 32 chars)

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:3001`

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── index.ts          # Environment configuration
│   │   ├── logger.ts         # Pino logger setup
│   │   ├── database.ts       # Prisma client
│   │   └── redis.ts          # Redis client with helpers
│   ├── services/             # Business logic (TODO)
│   ├── routes/               # API routes (TODO)
│   ├── middleware/           # Custom middleware (TODO)
│   ├── workers/              # Background jobs (TODO)
│   ├── schemas/              # Zod validation (TODO)
│   ├── types/                # TypeScript types (TODO)
│   ├── utils/                # Utility functions (TODO)
│   └── index.ts              # Main server file
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database (dev only)
- `npm run db:studio` - Open Prisma Studio GUI

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-22T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### API Info
```
GET /
```

## Database Models

- **User** - User accounts linked to wallet addresses
- **Event** - Cached event data from smart contracts
- **EventRegistration** - Event registrations and check-ins
- **Match** - AI-generated matches between users
- **Attestation** - ZK-proof credential attestations
- **ReputationScore** - User reputation scores
- **Session** - Authentication sessions
- **Job** - Background job tracking
- **Metric** - Analytics and metrics

## Next Steps

### Immediate Tasks

1. **Create Service Layer**
   - Contract interaction services (0G Chain)
   - 0G Storage service
   - AI matching service
   - Privy authentication service

2. **Create API Routes**
   - `/api/v1/profiles` - Profile management
   - `/api/v1/events` - Event management
   - `/api/v1/matches` - Match retrieval
   - `/api/v1/attestations` - Attestation management
   - `/api/v1/auth` - Authentication

3. **Implement Workers**
   - Match generation worker (Bull queue)
   - Reputation update worker
   - Event sync worker

4. **Add Middleware**
   - Authentication middleware
   - Authorization middleware
   - Request validation middleware

## Architecture

### Data Flow

1. **Frontend** → Backend API → Smart Contracts (0G Chain)
2. **Smart Contracts** → Backend (event listeners) → Database (cache)
3. **Backend** → 0G Storage (profile data, event metadata)
4. **Backend** → 0G Compute (AI matching)
5. **Backend** → 0G DA (verifiable proofs)

### Caching Strategy

- **Redis**: Short-term cache (API responses, user sessions)
- **PostgreSQL**: Long-term cache (contract data, matches, analytics)
- **0G Storage**: Permanent storage (profiles, event metadata)

## Environment-Specific Configs

### Development
- Detailed logging with Pino Pretty
- Hot reload with tsx watch
- Prisma Studio for database inspection
- CORS enabled for localhost:3000

### Production
- JSON logging (no colors)
- Rate limiting enabled
- Helmet security headers
- Database connection pooling

## Security Features

✅ Helmet security headers
✅ CORS configuration
✅ Rate limiting (100 req/15min)
✅ Input validation with Zod
✅ JWT authentication
✅ Secure session management
✅ Request ID tracking

## Dependencies

### Core
- **Fastify** - Fast web framework
- **Prisma** - Type-safe ORM
- **Redis** - Caching and job queue
- **Bull** - Background job processing

### Integrations
- **Privy** - Authentication
- **Ethers.js** - Blockchain interactions
- **Airstack** - Social graph
- **0G SDK** - Storage, DA, Compute

### Utilities
- **Zod** - Schema validation
- **Pino** - Logging
- **Axios** - HTTP client

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Reset database
npm run db:push -- --force-reset
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3002
```

## Contributing

See main project README for contribution guidelines.

## License

MIT
