import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

class AuthService {
  /**
   * Generate authentication message for signing
   */
  generateMessage(address: string): string {
    const timestamp = Date.now();
    return `Sign this message to authenticate with Voltz:\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  /**
   * Verify signature and create session
   */
  async login(address: string, signature: string, message: string) {
    try {
      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Invalid signature');
      }

      // Find or create user
      let user = await prisma.user.findUnique({ where: { address: address.toLowerCase() } });

      if (!user) {
        user = await prisma.user.create({
          data: { address: address.toLowerCase() },
        });
        logger.info({ address }, 'New user created');
      }

      // Create JWT token
      const token = jwt.sign(
        {
          address: user.address,
          userId: user.id,
        },
        config.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      logger.info({ userId: user.id }, 'User logged in');

      return {
        token,
        user: {
          id: user.id,
          address: user.address,
          profileTokenId: user.profileTokenId,
          profileType: user.profileType,
        },
        expiresAt,
      };
    } catch (error) {
      logger.error({ error, address }, 'Login failed');
      throw new Error('Authentication failed');
    }
  }

  /**
   * Verify token and return user
   */
  async verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as any;

      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Session expired');
      }

      return session.user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Logout (invalidate session)
   */
  async logout(token: string) {
    await prisma.session.delete({ where: { token } });
    logger.info('User logged out');
  }
}

export const authService = new AuthService();
export default authService;
