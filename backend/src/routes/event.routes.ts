import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { createEventSchema, registerForEventSchema } from '../schemas/index.js';
import { contractService } from '../services/contract.service.js';
import { storageService } from '../services/storage.service.js';
import { prisma } from '../config/database.js';

export async function eventRoutes(server: FastifyInstance) {
  // Create event
  server.post(
    '/',
    { preHandler: [authMiddleware, validateBody(createEventSchema)] },
    async (request) => {
      const user = request.user!;
      const eventData = request.body as any;

      // Upload metadata
      const storageResult = await storageService.uploadEvent(eventData, user.address);

      // Create event on-chain
      const result = await contractService.createEvent(
        eventData.name,
        eventData.description,
        eventData.location,
        new Date(eventData.startTime),
        new Date(eventData.endTime),
        eventData.maxAttendees || 0,
        storageResult.uri
      );

      // Cache in database
      await prisma.event.create({
        data: {
          contractId: result.eventId!,
          name: eventData.name,
          description: eventData.description,
          location: eventData.location,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          organizer: user.address,
          maxAttendees: eventData.maxAttendees,
          metadataURI: storageResult.uri,
        },
      });

      return { success: true, ...result };
    }
  );

  // Get event
  server.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error('Event not found');

    const metadata = await storageService.retrieve(event.metadataURI);
    return { event: { ...event, metadata } };
  });

  // Register for event
  server.post(
    '/:id/register',
    { preHandler: [authMiddleware, validateBody(registerForEventSchema)] },
    async (request) => {
      const user = request.user!;
      const { id } = request.params as { id: string };
      const { goals } = request.body as any;

      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) throw new Error('Event not found');

      // Register on-chain
      await contractService.registerForEvent(event.contractId, goals);

      // Cache in database
      await prisma.eventRegistration.create({
        data: {
          userId: user.userId,
          eventId: id,
          goals,
        },
      });

      return { success: true };
    }
  );

  // Check-in
  server.post('/:id/checkin', { preHandler: authMiddleware }, async (request) => {
    const user = request.user!;
    const { id } = request.params as { id: string };

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error('Event not found');

    await contractService.checkIn(event.contractId, user.address);

    await prisma.eventRegistration.updateMany({
      where: { eventId: id, userId: user.userId },
      data: { checkedIn: true, checkedInAt: new Date() },
    });

    return { success: true };
  });

  // List events
  server.get('/', async (request) => {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' },
      take: 50,
    });
    return { events };
  });

  // Get user's registered events (by wallet address) - for agent use
  server.get('/user/:address', async (request) => {
    const { address } = request.params as { address: string };

    // Find user by address
    const user = await prisma.user.findUnique({ where: { address } });
    if (!user) {
      return { events: [] };
    }

    // Get user's event registrations
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: user.id },
      include: { event: true },
    });

    // Extract and return events
    const events = registrations.map((reg: any) => reg.event).filter((e: any) => e.isActive);
    return { events };
  });
}

export default eventRoutes;
