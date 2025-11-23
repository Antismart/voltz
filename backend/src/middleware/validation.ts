import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema } from 'zod';

/**
 * Validate request body against Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body);
    } catch (error: any) {
      return reply.status(400).send({
        error: {
          message: 'Validation failed',
          details: error.errors,
        },
      });
    }
  };
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query);
    } catch (error: any) {
      return reply.status(400).send({
        error: {
          message: 'Invalid query parameters',
          details: error.errors,
        },
      });
    }
  };
}

/**
 * Validate URL parameters against Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.params = schema.parse(request.params);
    } catch (error: any) {
      return reply.status(400).send({
        error: {
          message: 'Invalid URL parameters',
          details: error.errors,
        },
      });
    }
  };
}
