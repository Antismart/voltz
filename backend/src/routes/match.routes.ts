import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../config/database.js';

export async function matchRoutes(server: FastifyInstance) {
  // Get all matches for a user (by wallet address) - for agent use
  server.get('/user/:address', async (request) => {
    const { address } = request.params as { address: string };

    // Find user by address
    const user = await prisma.user.findUnique({ where: { address } });
    if (!user) {
      return { matches: [] };
    }

    const matches = await prisma.match.findMany({
      where: { userId: user.id },
      orderBy: { score: 'desc' },
      take: 50,
    });

    return { matches };
  });

  // Get matches for user at event
  server.get('/:eventId', { preHandler: authMiddleware }, async (request) => {
    const user = request.user!;
    const { eventId } = request.params as { eventId: string };

    const matches = await prisma.match.findMany({
      where: { eventId, userId: user.userId },
      orderBy: { score: 'desc' },
      take: 50,
    });

    return { matches };
  });

  // Mark match as viewed
  server.post('/:matchId/view', { preHandler: authMiddleware }, async (request) => {
    const { matchId } = request.params as { matchId: string };
    await prisma.match.update({ where: { id: matchId }, data: { viewed: true } });
    return { success: true };
  });

  // Mark match as contacted
  server.post('/:matchId/contact', { preHandler: authMiddleware }, async (request) => {
    const { matchId } = request.params as { matchId: string };
    await prisma.match.update({ where: { id: matchId }, data: { contacted: true } });
    return { success: true };
  });
}

export default matchRoutes;
