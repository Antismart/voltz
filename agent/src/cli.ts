#!/usr/bin/env node

/**
 * Voltz Agent CLI
 * Command-line interface for testing and managing the Voltz XMTP agent
 */

import { Command } from 'commander';
import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import dotenv from 'dotenv';
import readline from 'readline';
import { initializeLogger } from './utils/logger.js';

dotenv.config();

const logger = initializeLogger();
const program = new Command();

program
  .name('voltz-agent-cli')
  .description('CLI for testing Voltz XMTP Agent')
  .version('1.0.0');

/**
 * Test connection to agent
 */
program
  .command('test-connection')
  .description('Test connection to the agent')
  .argument('<agentAddress>', 'Agent wallet address')
  .action(async (agentAddress: string) => {
    try {
      logger.info(`Testing connection to agent: ${agentAddress}`);
      
      // Create a test wallet
      const wallet = Wallet.createRandom();
      logger.info(`Created test wallet: ${wallet.address}`);
      
      // Initialize XMTP client
      const xmtp = await Client.create(wallet, {
        env: (process.env.XMTP_ENV as 'local' | 'dev' | 'production') || 'dev',
      });
      
      // Start a conversation
      const conversation = await xmtp.conversations.newConversation(agentAddress);
      logger.info('✅ Conversation created successfully');
      
      // Send test message
      await conversation.send('Hello from CLI test!');
      logger.info('✅ Test message sent');
      
      // Wait for response
      logger.info('Waiting for response...');
      for await (const message of await conversation.streamMessages()) {
        if (message.senderAddress !== wallet.address) {
          logger.info(`📩 Response: ${message.content}`);
          break;
        }
      }
      
      logger.info('✅ Connection test complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Connection test failed:', error);
      process.exit(1);
    }
  });

/**
 * Interactive chat with agent
 */
program
  .command('chat')
  .description('Start interactive chat with the agent')
  .argument('<agentAddress>', 'Agent wallet address')
  .option('-k, --key <privateKey>', 'Your wallet private key')
  .action(async (agentAddress: string, options: { key?: string }) => {
    try {
      // Get wallet
      let wallet: Wallet;
      if (options.key) {
        wallet = new Wallet(options.key);
      } else {
        wallet = Wallet.createRandom();
        logger.info(`💡 No key provided, created temporary wallet: ${wallet.address}`);
      }
      
      logger.info(`Starting chat with agent: ${agentAddress}`);
      
      // Initialize XMTP client
      const xmtp = await Client.create(wallet, {
        env: (process.env.XMTP_ENV as 'local' | 'dev' | 'production') || 'dev',
      });
      
      // Start conversation
      const conversation = await xmtp.conversations.newConversation(agentAddress);
      logger.info('✅ Connected to agent');
      logger.info('Type your messages (or "exit" to quit):\n');
      
      // Stream messages in background
      const streamMessages = async () => {
        for await (const message of await conversation.streamMessages()) {
          if (message.senderAddress !== wallet.address) {
            console.log(`\n🤖 Agent: ${message.content}\n> `);
          }
        }
      };
      streamMessages();
      
      // Create readline interface
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> ',
      });
      
      rl.prompt();
      
      rl.on('line', async (line: string) => {
        const input = line.trim();
        
        if (input.toLowerCase() === 'exit') {
          logger.info('👋 Goodbye!');
          rl.close();
          process.exit(0);
        }
        
        if (input) {
          await conversation.send(input);
        }
        
        rl.prompt();
      });
      
    } catch (error) {
      logger.error('❌ Chat failed:', error);
      process.exit(1);
    }
  });

/**
 * Send a single message to agent
 */
program
  .command('send')
  .description('Send a single message to the agent')
  .argument('<agentAddress>', 'Agent wallet address')
  .argument('<message>', 'Message to send')
  .option('-k, --key <privateKey>', 'Your wallet private key')
  .action(async (agentAddress: string, message: string, options: { key?: string }) => {
    try {
      // Get wallet
      let wallet: Wallet;
      if (options.key) {
        wallet = new Wallet(options.key);
      } else {
        wallet = Wallet.createRandom();
        logger.info(`Created temporary wallet: ${wallet.address}`);
      }
      
      // Initialize XMTP client
      const xmtp = await Client.create(wallet, {
        env: (process.env.XMTP_ENV as 'local' | 'dev' | 'production') || 'dev',
      });
      
      // Send message
      const conversation = await xmtp.conversations.newConversation(agentAddress);
      await conversation.send(message);
      logger.info('✅ Message sent successfully');
      
      // Wait briefly for response
      logger.info('Waiting for response...');
      const timeout = setTimeout(() => {
        logger.info('No response received (timeout)');
        process.exit(0);
      }, 10000);
      
      for await (const msg of await conversation.streamMessages()) {
        if (msg.senderAddress !== wallet.address) {
          logger.info(`📩 Response: ${msg.content}`);
          clearTimeout(timeout);
          process.exit(0);
        }
      }
    } catch (error) {
      logger.error('❌ Failed to send message:', error);
      process.exit(1);
    }
  });

/**
 * Get agent info
 */
program
  .command('info')
  .description('Get information about the configured agent')
  .action(async () => {
    try {
      const walletKey = process.env.XMTP_WALLET_KEY;
      if (!walletKey) {
        logger.error('❌ XMTP_WALLET_KEY not found in environment');
        process.exit(1);
      }
      
      const wallet = new Wallet(walletKey);
      logger.info('📋 Agent Information:');
      logger.info(`Address: ${wallet.address}`);
      logger.info(`Environment: ${process.env.XMTP_ENV || 'dev'}`);
      logger.info(`Backend API: ${process.env.API_URL || 'http://localhost:3001'}`);
      logger.info(`Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    } catch (error) {
      logger.error('❌ Failed to get agent info:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
