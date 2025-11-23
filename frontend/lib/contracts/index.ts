// Export contract addresses and ABIs
export { CONTRACT_ADDRESSES } from './addresses';

// Import ABIs from JSON files
import VoltzProfileABI from './VoltzProfile.abi.json';
import VoltzEventABI from './VoltzEvent.abi.json';
import VoltzReputationABI from './VoltzReputation.abi.json';
import VoltzAttestationABI from './VoltzAttestation.abi.json';

export const ABIS = {
  VoltzProfile: VoltzProfileABI,
  VoltzEvent: VoltzEventABI,
  VoltzReputation: VoltzReputationABI,
  VoltzAttestation: VoltzAttestationABI,
} as const;
