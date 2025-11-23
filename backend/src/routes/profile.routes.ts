import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { createProfileSchema, updateProfileSchema } from '../schemas/index.js';
import { contractService } from '../services/contract.service.js';
import { storageService } from '../services/storage.service.js';
import { prisma } from '../config/database.js';

export async function profileRoutes(server: FastifyInstance) {
  // Create profile
  server.post(
    '/',
    { preHandler: [authMiddleware, validateBody(createProfileSchema)] },
    async (request, reply) => {
      const user = request.user!;
      const metadata = request.body as any;

      // Check if profile already exists
      const hasProfile = await contractService.hasProfile(user.address);
      if (hasProfile) {
        return reply.status(400).send({ error: { message: 'Profile already exists' } });
      }

      // Upload metadata to 0G Storage
      const storageResult = await storageService.uploadProfile({
        address: user.address,
        ...metadata,
      });

      // Create profile on-chain
      const result = await contractService.createProfile(
        user.address,
        metadata.profileType,
        storageResult.uri
      );

      // Update database
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          profileTokenId: result.tokenId,
          profileType: metadata.profileType,
          storageURI: storageResult.uri,
        },
      });

      return { success: true, ...result, storageURI: storageResult.uri };
    }
  );

  // Get profile by address
  server.get('/:address', async (request) => {
    const { address } = request.params as { address: string };

    const hasProfile = await contractService.hasProfile(address);
    if (!hasProfile) {
      return { profile: null };
    }

    const profile = await contractService.getProfile(address);
    const metadata = await storageService.retrieve(profile.storageURI);

    return { profile: { ...profile, metadata } };
  });

  // Update profile
  server.put(
    '/',
    { preHandler: [authMiddleware, validateBody(updateProfileSchema)] },
    async (request) => {
      const user = request.user!;
      const updates = request.body as any;

      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!dbUser?.profileTokenId) {
        throw new Error('Profile not found');
      }

      // Get existing metadata
      const profile = await contractService.getProfile(user.address);
      const existingMetadata = await storageService.retrieve(profile.storageURI);

      // Merge updates
      const updatedMetadata = { ...existingMetadata, ...updates };

      // Upload new metadata
      const storageResult = await storageService.uploadProfile(updatedMetadata);

      // Update on-chain
      const result = await contractService.updateProfile(
        dbUser.profileTokenId,
        storageResult.uri
      );

      // Update database
      await prisma.user.update({
        where: { id: user.userId },
        data: { storageURI: storageResult.uri },
      });

      return { success: true, ...result };
    }
  );

  // Get current user's profile
  server.get(
    '/me',
    { preHandler: authMiddleware },
    async (request) => {
      const user = request.user!;
      const hasProfile = await contractService.hasProfile(user.address);

      if (!hasProfile) {
        return { profile: null };
      }

      const profile = await contractService.getProfile(user.address);
      const metadata = await storageService.retrieve(profile.storageURI);

      return { profile: { ...profile, metadata } };
    }
  );
}

export default profileRoutes;
