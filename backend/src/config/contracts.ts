import { config } from './index.js';

// Contract addresses
export const CONTRACTS = {
  PROFILE: config.PROFILE_CONTRACT_ADDRESS || '',
  EVENT: config.EVENT_CONTRACT_ADDRESS || '',
  REPUTATION: config.REPUTATION_CONTRACT_ADDRESS || '',
  ATTESTATION: config.ATTESTATION_CONTRACT_ADDRESS || '',
} as const;

// Simplified ABIs (minimal interface for backend)
// Full ABIs should be imported from contract artifacts after deployment

export const PROFILE_ABI = [
  'function createProfile(address to, string profileType, string storageURI) returns (uint256)',
  'function updateProfile(uint256 tokenId, string storageURI)',
  'function getProfileByAddress(address user) view returns (tuple(string profileType, uint256 createdAt, uint256 updatedAt, bool isActive, string storageURI))',
  'function hasProfile(address user) view returns (bool)',
  'function addressToProfile(address) view returns (uint256)',
  'event ProfileCreated(address indexed owner, uint256 indexed tokenId, string profileType)',
  'event ProfileUpdated(uint256 indexed tokenId, string storageURI)',
] as const;

export const EVENT_ABI = [
  'function createEvent(string name, string description, string location, uint256 startTime, uint256 endTime, uint256 maxAttendees, string metadataURI) returns (uint256)',
  'function registerForEvent(uint256 eventId, string goals)',
  'function checkIn(uint256 eventId, address attendee)',
  'function events(uint256) view returns (tuple(string name, string description, string location, uint256 startTime, uint256 endTime, address organizer, uint256 maxAttendees, uint256 registeredCount, uint256 checkedInCount, bool isActive, string metadataURI))',
  'function registrations(uint256, address) view returns (tuple(uint256 eventId, address attendee, uint256 registeredAt, bool checkedIn, uint256 checkedInAt, string goals))',
  'function isRegistered(uint256 eventId, address user) view returns (bool)',
  'function isCheckedIn(uint256 eventId, address user) view returns (bool)',
  'event EventCreated(uint256 indexed eventId, string name, address indexed organizer)',
  'event AttendeeRegistered(uint256 indexed eventId, address indexed attendee)',
  'event AttendeeCheckedIn(uint256 indexed eventId, address indexed attendee)',
] as const;

export const REPUTATION_ABI = [
  'function addScore(address user, uint256 points, string category, string proofURI)',
  'function getScore(address user) view returns (tuple(uint256 totalScore, uint256 eventAttendance, uint256 qualityConnections, uint256 workshopParticipation, uint256 credentialVerifications, uint256 communityFeedback, uint256 lastUpdated))',
  'function getTier(address user) view returns (string)',
  'event ScoreUpdated(address indexed user, uint256 newTotal, string category, uint256 points)',
  'event TierAchieved(address indexed user, string tier, uint256 score)',
] as const;

export const ATTESTATION_ABI = [
  'function createAttestation(address subject, uint8 attestationType, string claim, bytes32 proofHash, string proofURI, uint256 expiresAt) returns (uint256)',
  'function revokeAttestation(uint256 attestationId)',
  'function isValid(uint256 attestationId) view returns (bool)',
  'function attestations(uint256) view returns (tuple(uint256 id, address subject, uint8 attestationType, string claim, bytes32 proofHash, string proofURI, address verifier, uint256 timestamp, uint256 expiresAt, bool revoked))',
  'function getUserAttestations(address user) view returns (uint256[])',
  'event AttestationCreated(uint256 indexed id, address indexed subject, uint8 attestationType, string claim)',
  'event AttestationRevoked(uint256 indexed id)',
] as const;

export const areContractsConfigured = () => {
  return !!(
    CONTRACTS.PROFILE &&
    CONTRACTS.EVENT &&
    CONTRACTS.REPUTATION &&
    CONTRACTS.ATTESTATION
  );
};
