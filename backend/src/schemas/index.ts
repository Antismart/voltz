import { z } from 'zod';

// Ethereum address schema
export const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Profile schemas
export const createProfileSchema = z.object({
  profileType: z.enum(['developer', 'designer', 'founder', 'investor', 'researcher', 'other']),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).max(20),
  interests: z.array(z.string()).max(20),
  goals: z.array(z.string()).max(10),
  socials: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
  }).optional(),
  avatar: z.string().url().optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

// Event schemas
export const createEventSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  location: z.string().min(3).max(200),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  maxAttendees: z.number().int().positive().optional(),
  tags: z.array(z.string()).max(10).optional(),
  image: z.string().url().optional(),
  website: z.string().url().optional(),
});

export const registerForEventSchema = z.object({
  eventId: z.string().cuid(),
  goals: z.string().min(10).max(500),
});

export const checkInSchema = z.object({
  eventId: z.string().cuid(),
  attendeeAddress: addressSchema.optional(),
});

// Match schemas
export const getMatchesSchema = z.object({
  eventId: z.string().cuid(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  minScore: z.number().int().min(0).max(100).optional(),
});

export const generateMatchesSchema = z.object({
  eventId: z.string().cuid(),
  forceRegenerate: z.boolean().default(false),
});

// Attestation schemas
export const createAttestationSchema = z.object({
  userAddress: addressSchema,
  attestationType: z.enum(['GITHUB', 'TWITTER', 'LINKEDIN', 'CUSTOM']),
  claim: z.string().min(5).max(200),
  proofHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  proofURI: z.string().url(),
  expiresAt: z.string().datetime().optional(),
});

export const revokeAttestationSchema = z.object({
  attestationId: z.string().cuid(),
});

// Auth schemas
export const loginSchema = z.object({
  address: addressSchema,
  signature: z.string(),
  message: z.string(),
});

export const verifyTokenSchema = z.object({
  token: z.string(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// Query filters
export const eventFiltersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  organizer: addressSchema.optional(),
  isActive: z.boolean().optional(),
});

export const userFiltersSchema = z.object({
  profileType: z.string().optional(),
  minReputation: z.number().int().min(0).optional(),
  hasAttestation: z.boolean().optional(),
});

// Type inference helpers
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type GetMatchesInput = z.infer<typeof getMatchesSchema>;
export type GenerateMatchesInput = z.infer<typeof generateMatchesSchema>;
export type CreateAttestationInput = z.infer<typeof createAttestationSchema>;
export type RevokeAttestationInput = z.infer<typeof revokeAttestationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
