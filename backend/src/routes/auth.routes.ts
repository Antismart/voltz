import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { loginSchema } from '../schemas/index.js';

export async function authRoutes(server: FastifyInstance) {
  // Generate message for signing
  server.get('/message/:address', async (request, reply) => {
    const { address } = request.params as { address: string };
    const message = authService.generateMessage(address);
    return { message };
  });

  // Login with signature
  server.post(
    '/login',
    { preHandler: validateBody(loginSchema) },
    async (request, reply) => {
      const { address, signature, message } = request.body as any;
      const result = await authService.login(address, signature, message);
      return result;
    }
  );

  // Verify token
  server.get('/verify', { preHandler: authMiddleware }, async (request) => {
    return { valid: true, user: request.user };
  });

  // Logout
  server.post('/logout', { preHandler: authMiddleware }, async (request) => {
    const token = request.headers.authorization!.substring(7);
    await authService.logout(token);
    return { success: true };
  });

  // Get current user
  server.get('/me', { preHandler: authMiddleware }, async (request) => {
    return { user: request.user };
  });
}

export default authRoutes;
