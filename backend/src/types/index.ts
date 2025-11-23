// User types
export interface UserProfile {
  address: string;
  profileTokenId?: number;
  profileType?: string;
  storageURI?: string;
  isActive: boolean;
  reputation?: ReputationData;
  attestations?: AttestationData[];
}

// Event types
export interface EventData {
  contractId: number;
  name: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizer: string;
  maxAttendees?: number;
  registeredCount: number;
  checkedInCount: number;
  metadataURI: string;
  isActive: boolean;
}

// Match types
export interface MatchData {
  id: string;
  eventId: string;
  userId: string;
  matchedUser: MatchedUserInfo;
  score: number;
  reasoning: string;
  proofURI?: string;
  viewed: boolean;
  contacted: boolean;
  createdAt: Date;
}

export interface MatchedUserInfo {
  address: string;
  profileType?: string;
  reputation?: number;
  commonInterests?: string[];
}

// Attestation types
export interface AttestationData {
  contractId: number;
  attestationType: 'GITHUB' | 'TWITTER' | 'LINKEDIN' | 'CUSTOM';
  claim: string;
  proofHash: string;
  proofURI: string;
  verifier: string;
  expiresAt?: Date;
  revoked: boolean;
  createdAt: Date;
}

// Reputation types
export interface ReputationData {
  totalScore: number;
  eventAttendance: number;
  qualityConnections: number;
  workshopParticipation: number;
  credentialVerifications: number;
  communityFeedback: number;
  tier: 'Newcomer' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

// 0G Storage types
export interface StorageUploadResult {
  uri: string;
  cid: string;
  size: number;
}

export interface ProfileMetadata {
  address: string;
  profileType: string;
  bio?: string;
  skills: string[];
  interests: string[];
  goals: string[];
  socials?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  avatar?: string;
}

export interface EventMetadata {
  name: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  tags: string[];
  image?: string;
  website?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Worker job types
export interface MatchGenerationJob {
  eventId: string;
  forceRegenerate?: boolean;
}

export interface ReputationUpdateJob {
  userId: string;
  category: string;
  points: number;
  proofURI: string;
}

export interface EventSyncJob {
  contractId: number;
  action: 'create' | 'update' | 'register' | 'checkin';
}

// Authentication types
export interface AuthUser {
  address: string;
  userId: string;
  sessionId: string;
}

export interface JWTPayload {
  address: string;
  userId: string;
  iat: number;
  exp: number;
}
