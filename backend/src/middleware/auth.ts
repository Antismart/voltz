import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import type { JWTPayload, AuthUser } from '../types/index.js';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: { message: 'Missing or invalid authorization header' },
      });
    }

    const token = authHeader.substring(7);

    // Verify JWT
    const payload = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    // Check if session exists and is valid
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return reply.status(401).send({
        error: { message: 'Session expired or invalid' },
      });
    }

    // Attach user to request
    request.user = {
      address: session.user.address,
      userId: session.userId,
      sessionId: session.id,
    };
  } catch (error) {
    return reply.status(401).send({
      error: { message: 'Invalid or expired token' },
    });
  }
}

/**
 * Optional auth - doesn't fail if no token provided
 */
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      await authMiddleware(request, reply);
    }
  } catch (error) {
    // Silently fail for optional auth
  }
}
