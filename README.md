# Voltz - AI-Powered Event Networking Platform

> Intelligent event connections using AI-powered verified matching on 0G Infrastructure

[![0G Chain](https://img.shields.io/badge/0G-Chain-blue)](https://0g.ai)
[![vlayer](https://img.shields.io/badge/vlayer-ZK_Proofs-purple)](https://vlayer.xyz)
[![XMTP](https://img.shields.io/badge/XMTP-Messaging-green)](https://xmtp.org)
[![Privy](https://img.shields.io/badge/Privy-Auth-orange)](https://privy.io)

## Overview

Voltz is a decentralized, AI-enhanced event networking platform that solves the "cold start problem" at technical conferences and hackathons. The platform leverages zero-knowledge proofs for privacy-preserving credential verification, decentralized AI for intelligent matchmaking, and blockchain infrastructure for trustless reputation systems.

### Core Features

- **🔐 Privacy-Preserving Identity**: Zero-knowledge proofs via vlayer for credential verification (GitHub, Twitter, LinkedIn) without revealing personal data
- **🤖 AI-Powered Matching**: Decentralized AI on 0G Compute matches attendees based on verified skills, interests, and goals
- **💬 Decentralized Messaging**: End-to-end encrypted XMTP messaging that persists across events
- **🏆 Verifiable Reputation**: On-chain reputation system with cryptographic proofs stored on 0G DA
- **📱 Seamless Web3**: Privy authentication with embedded wallets for smooth onboarding
- **⚡ Infinite Scalability**: 0G's high-throughput infrastructure supports 10,000+ attendee events

## Technology Stack

### Infrastructure Layer
- **0G Chain**: EVM-compatible L1 for smart contracts
- **0G Storage**: Decentralized storage for user profiles and event data
- **0G DA**: Data availability layer for verifiable proofs
- **0G Compute**: Decentralized AI inference for matching algorithms

### Protocol Layer
- **vlayer**: ZK-TLS proofs for credential verification
- **XMTP**: Decentralized messaging protocol
- **Privy**: Authentication and wallet management
- **vouch SDK**: Credential verification interface
- **Airstack**: Social graph integration

### Application Layer
- **Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS
- **Backend**: Fastify API with PostgreSQL, Redis, Bull queue
- **Agent**: XMTP agent for messaging automation
- **Contracts**: Solidity smart contracts on 0G Chain

## Project Structure

```
voltz/
├── frontend/          # Next.js 16 web application
│   ├── app/          # App router pages and layouts
│   ├── components/   # React components
│   ├── lib/          # Utilities and configurations
│   └── stores/       # Zustand state management
│
├── backend/          # Fastify API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── services/    # Business logic services
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/  # Custom middleware
│   │   ├── workers/     # Background job workers
│   │   └── schemas/     # Zod validation schemas
│   └── prisma/          # Database schema
│
├── contracts/        # Smart contracts
│   ├── contracts/       # Solidity contracts
│   ├── test/           # Contract tests
│   ├── ignition/       # Deployment scripts
│   └── scripts/        # Utility scripts
│
├── agent/            # XMTP messaging agent
│   ├── src/
│   │   ├── handlers/   # Message event handlers
│   │   ├── middleware/ # Agent middleware
│   │   └── utils/      # Helper functions
│   └── index.ts        # Agent entry point
│
└── docs/             # Documentation (to be created)
```

## Smart Contracts

### Core Contracts

1. **VoltzProfile.sol** (`contracts/contracts/VoltzProfile.sol`)
   - Soulbound NFT profiles for users
   - On-chain metadata with off-chain storage references
   - Profile type categorization

2. **VoltzEvent.sol** (`contracts/contracts/VoltzEvent.sol`)
   - Event creation and management
   - Registration and check-in tracking
   - Attendee management with verification

3. **VoltzReputation.sol** (`contracts/contracts/VoltzReputation.sol`)
   - Point-based reputation system
   - Category-specific scoring (events, connections, workshops, credentials)
   - Tier-based achievements (Bronze, Silver, Gold, Platinum)

4. **VoltzAttestation.sol** (`contracts/contracts/VoltzAttestation.sol`)
   - ZK proof-based credential attestations
   - Support for GitHub, Twitter, LinkedIn, and custom credentials
   - Verifiable claims without revealing sensitive data

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14
- Redis >= 7.0
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voltz.git
   cd voltz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

### Development

Run all services in development mode:

```bash
# From root directory
npm run dev
```

Or run individual services:

```bash
# Frontend (http://localhost:3000)
npm run dev:frontend

# Backend API (http://localhost:3001)
npm run dev:backend

# XMTP Agent
npm run dev:agent

# Smart contracts (local network)
npm run dev:contracts
```

### Smart Contracts

**Compile contracts:**
```bash
cd contracts
npm run compile
```

**Run tests:**
```bash
npm test
```

**Deploy to 0G testnet:**
```bash
npm run deploy
```

**Deploy to local network:**
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy
npm run deploy:local
```

## Configuration

### Environment Variables

See `.env.example` for all required environment variables. Key configurations:

#### 0G Infrastructure
```env
OG_CHAIN_RPC_URL=https://rpc-testnet.0g.ai
OG_CHAIN_ID=16600
OG_STORAGE_URL=https://storage-testnet.0g.ai
OG_DA_URL=https://da-testnet.0g.ai
OG_COMPUTE_URL=https://compute-testnet.0g.ai
OG_PRIVATE_KEY=your_private_key_here
```

#### vlayer
```env
VLAYER_API_URL=https://api.vlayer.xyz
VLAYER_API_KEY=your_api_key_here
```

#### XMTP
```env
XMTP_ENV=dev
XMTP_WALLET_KEY=your_wallet_key_here
XMTP_DB_ENCRYPTION_KEY=your_encryption_key_here
```

#### Privy
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
PRIVY_APP_SECRET=your_app_secret_here
```

## Architecture

### User Flow

1. **Onboarding**
   - Connect with Privy (email/social/wallet)
   - Create profile with type selection
   - Verify credentials with vouch + vlayer
   - AI generates semantic profile (0G Compute)
   - Profile NFT minted on 0G Chain

2. **Event Discovery**
   - Browse upcoming events
   - View AI-predicted match count
   - Register for events with goals

3. **Pre-Event Matching**
   - AI analyzes all attendees (0G Compute)
   - Generates ranked matches with explanations
   - Stored on 0G DA with verifiable proof
   - Users receive match notifications

4. **During Event**
   - QR code check-in
   - Live nearby matches
   - XMTP messaging with matches
   - Workshop/session tracking

5. **Post-Event**
   - Event recap and insights
   - Reputation score update
   - Follow-up recommendations
   - Attendance NFT minted

### Data Flow

- **On-Chain**: Profile NFTs, event registrations, attestations, reputation scores
- **0G Storage**: Full profile data, event metadata (encrypted)
- **0G DA**: ZK proofs, AI computation proofs, match results
- **XMTP**: End-to-end encrypted messages
- **PostgreSQL**: Cached data, analytics, session management
- **Redis**: Real-time caching, rate limiting, job queue

## Testing

### Smart Contracts
```bash
cd contracts
npm test
npm run test:coverage
```

### Backend
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test
```

## Deployment

### Smart Contracts to 0G Testnet

1. Configure environment:
   ```bash
   cd contracts
   cp .env.example .env
   # Add OG_PRIVATE_KEY and other variables
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

3. Verify (optional):
   ```bash
   npm run verify
   ```

### Backend API

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

## Contributing

This is a hackathon project built for [ETHGlobal]. Contributions welcome!

## Security

- All credentials verified via ZK proofs (no PII stored)
- End-to-end encrypted messaging via XMTP
- Soulbound profile NFTs (non-transferable)
- Rate limiting and DDoS protection
- Smart contract audits pending

## License

MIT

## Acknowledgments

- **0G Labs** - Infrastructure and compute layer
- **vlayer** - ZK proof generation
- **XMTP** - Decentralized messaging
- **Privy** - Authentication and wallet management
- **vouch** - Credential verification SDK

## Links

- Documentation: [docs/](./docs)
- Smart Contracts: [contracts/](./contracts)
- Frontend: [frontend/](./frontend)
- Backend API: [backend/](./backend)
- XMTP Agent: [agent/](./agent)

---

Built with ❤️ for the decentralized future
