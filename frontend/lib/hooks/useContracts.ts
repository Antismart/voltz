import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ABIS } from '../contracts';

// Profile Contract Hooks
export function useReadProfile(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.VoltzProfile as `0x${string}`,
    abi: ABIS.VoltzProfile,
    functionName: 'getProfileByAddress',
    args: address ? [address] : undefined,
  });
}

export function useCreateProfile() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createProfile = (profileType: number, metadataURI: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.VoltzProfile as `0x${string}`,
      abi: ABIS.VoltzProfile,
      functionName: 'createProfile',
      args: [profileType, metadataURI],
    });
  };

  return { createProfile, isLoading, isSuccess, hash };
}

// Event Contract Hooks
export function useReadEvent(eventId?: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.VoltzEvent as `0x${string}`,
    abi: ABIS.VoltzEvent,
    functionName: 'getEvent',
    args: eventId !== undefined ? [eventId] : undefined,
  });
}

export function useRegisterForEvent() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (eventId: bigint, goals: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.VoltzEvent as `0x${string}`,
      abi: ABIS.VoltzEvent,
      functionName: 'registerForEvent',
      args: [eventId, goals],
    });
  };

  return { register, isLoading, isSuccess, hash };
}

export function useCheckInEvent() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const checkIn = (eventId: bigint, attendee: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.VoltzEvent as `0x${string}`,
      abi: ABIS.VoltzEvent,
      functionName: 'checkIn',
      args: [eventId, attendee],
    });
  };

  return { checkIn, isLoading, isSuccess, hash };
}

// Reputation Contract Hooks
export function useReadReputation(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.VoltzReputation as `0x${string}`,
    abi: ABIS.VoltzReputation,
    functionName: 'getReputation',
    args: address ? [address] : undefined,
  });
}

// Attestation Contract Hooks
export function useReadAttestations(address?: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESSES.VoltzAttestation as `0x${string}`,
    abi: ABIS.VoltzAttestation,
    functionName: 'getUserAttestations',
    args: address ? [address] : undefined,
  });
}

export function useCreateAttestation() {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createAttestation = (
    user: `0x${string}`,
    credType: number,
    proofData: string
  ) => {
    writeContract({
      address: CONTRACT_ADDRESSES.VoltzAttestation as `0x${string}`,
      abi: ABIS.VoltzAttestation,
      functionName: 'createAttestation',
      args: [user, credType, proofData],
    });
  };

  return { createAttestation, isLoading, isSuccess, hash };
}
