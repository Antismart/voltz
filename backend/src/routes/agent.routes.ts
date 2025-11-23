import { FastifyInstance } from 'fastify';
import { prisma } from '../config/database.js';

/**
 * Agent-specific routes for XMTP bot integration
 */
export async function agentRoutes(server: FastifyInstance) {
  // Log agent message activity
  server.post('/log', async (request) => {
    const { fromAddress, toAddress, messageType, timestamp } = request.body as {
      fromAddress: string;
      toAddress: string;
      messageType: string;
      timestamp: Date;
    };

    try {
      // Store in metrics table for tracking
      await prisma.metric.create({
        data: {
          name: 'agent_message',
          value: 1,
          metadata: {
            fromAddress,
            toAddress,
            messageType,
          },
          timestamp: new Date(timestamp),
        },
      });

      return { success: true };
    } catch (error) {
      server.log.error({ error }, 'Failed to log agent message');
      return { success: false };
    }
  });

  // Get agent statistics
  server.get('/stats', async () => {
    try {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const messageCount = await prisma.metric.count({
        where: {
          name: 'agent_message',
          timestamp: { gte: last24h },
        },
      });

      const uniqueUsers = await prisma.metric.findMany({
        where: {
          name: 'agent_message',
          timestamp: { gte: last24h },
        },
        select: { metadata: true },
      });

      const uniqueAddresses = new Set(
        uniqueUsers.map((m: any) => m.metadata?.toAddress).filter(Boolean)
      );

      return {
        stats: {
          messagesLast24h: messageCount,
          uniqueUsersLast24h: uniqueAddresses.size,
        },
      };
    } catch (error) {
      server.log.error({ error }, 'Failed to get agent stats');
      return { stats: { messagesLast24h: 0, uniqueUsersLast24h: 0 } };
    }
  });
}

export default agentRoutes;
