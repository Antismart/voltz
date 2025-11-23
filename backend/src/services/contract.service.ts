import { ethers } from 'ethers';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import {
  CONTRACTS,
  PROFILE_ABI,
  EVENT_ABI,
  REPUTATION_ABI,
  ATTESTATION_ABI,
  areContractsConfigured,
} from '../config/contracts.js';

class ContractService {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private profileContract?: ethers.Contract;
  private eventContract?: ethers.Contract;
  private reputationContract?: ethers.Contract;
  private attestationContract?: ethers.Contract;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(config.OG_CHAIN_RPC_URL);

    // Initialize signer if private key provided
    if (config.OG_PRIVATE_KEY) {
      this.signer = new ethers.Wallet(config.OG_PRIVATE_KEY, this.provider);
    }

    // Initialize contracts
    this.initializeContracts();
  }

  private initializeContracts() {
    if (!areContractsConfigured()) {
      logger.warn('⚠️  Contract addresses not configured. Some features will be unavailable.');
      return;
    }

    const signerOrProvider = this.signer || this.provider;

    this.profileContract = new ethers.Contract(
      CONTRACTS.PROFILE,
      PROFILE_ABI,
      signerOrProvider
    );

    this.eventContract = new ethers.Contract(
      CONTRACTS.EVENT,
      EVENT_ABI,
      signerOrProvider
    );

    this.reputationContract = new ethers.Contract(
      CONTRACTS.REPUTATION,
      REPUTATION_ABI,
      signerOrProvider
    );

    this.attestationContract = new ethers.Contract(
      CONTRACTS.ATTESTATION,
      ATTESTATION_ABI,
      signerOrProvider
    );

    logger.info('✅ Smart contracts initialized');
  }

  // Profile contract methods
  async createProfile(to: string, profileType: string, storageURI: string) {
    if (!this.profileContract || !this.signer) {
      throw new Error('Profile contract not initialized or no signer available');
    }

    const tx = await this.profileContract.createProfile(to, profileType, storageURI);
    const receipt = await tx.wait();

    // Extract ProfileCreated event
    const event = receipt.logs.find(
      (log: any) => log.eventName === 'ProfileCreated'
    );

    return {
      txHash: receipt.hash,
      tokenId: event?.args?.tokenId ? Number(event.args.tokenId) : null,
    };
  }

  async getProfile(address: string) {
    if (!this.profileContract) {
      throw new Error('Profile contract not initialized');
    }

    const profile = await this.profileContract.getProfileByAddress(address);
    return {
      profileType: profile.profileType,
      createdAt: new Date(Number(profile.createdAt) * 1000),
      updatedAt: new Date(Number(profile.updatedAt) * 1000),
      isActive: profile.isActive,
      storageURI: profile.storageURI,
    };
  }

  async hasProfile(address: string): Promise<boolean> {
    if (!this.profileContract) return false;
    return await this.profileContract.hasProfile(address);
  }

  async updateProfile(tokenId: number, storageURI: string) {
    if (!this.profileContract || !this.signer) {
      throw new Error('Profile contract not initialized or no signer available');
    }

    const tx = await this.profileContract.updateProfile(tokenId, storageURI);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  // Event contract methods
  async createEvent(
    name: string,
    description: string,
    location: string,
    startTime: Date,
    endTime: Date,
    maxAttendees: number,
    metadataURI: string
  ) {
    if (!this.eventContract || !this.signer) {
      throw new Error('Event contract not initialized or no signer available');
    }

    const tx = await this.eventContract.createEvent(
      name,
      description,
      location,
      Math.floor(startTime.getTime() / 1000),
      Math.floor(endTime.getTime() / 1000),
      maxAttendees,
      metadataURI
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find((log: any) => log.eventName === 'EventCreated');

    return {
      txHash: receipt.hash,
      eventId: event?.args?.eventId ? Number(event.args.eventId) : null,
    };
  }

  async getEvent(eventId: number) {
    if (!this.eventContract) {
      throw new Error('Event contract not initialized');
    }

    const event = await this.eventContract.events(eventId);
    return {
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: new Date(Number(event.startTime) * 1000),
      endTime: new Date(Number(event.endTime) * 1000),
      organizer: event.organizer,
      maxAttendees: Number(event.maxAttendees),
      registeredCount: Number(event.registeredCount),
      checkedInCount: Number(event.checkedInCount),
      isActive: event.isActive,
      metadataURI: event.metadataURI,
    };
  }

  async registerForEvent(eventId: number, goals: string, userAddress?: string) {
    if (!this.eventContract || !this.signer) {
      throw new Error('Event contract not initialized or no signer available');
    }

    // If userAddress provided and different from signer, need to use that address
    const contract = userAddress && userAddress !== this.signer.address
      ? this.eventContract.connect(this.provider)
      : this.eventContract;

    const tx = await contract.registerForEvent(eventId, goals);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async checkIn(eventId: number, attendeeAddress: string) {
    if (!this.eventContract || !this.signer) {
      throw new Error('Event contract not initialized or no signer available');
    }

    const tx = await this.eventContract.checkIn(eventId, attendeeAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async isRegistered(eventId: number, userAddress: string): Promise<boolean> {
    if (!this.eventContract) return false;
    return await this.eventContract.isRegistered(eventId, userAddress);
  }

  async isCheckedIn(eventId: number, userAddress: string): Promise<boolean> {
    if (!this.eventContract) return false;
    return await this.eventContract.isCheckedIn(eventId, userAddress);
  }

  // Reputation contract methods
  async addScore(
    userAddress: string,
    points: number,
    category: string,
    proofURI: string
  ) {
    if (!this.reputationContract || !this.signer) {
      throw new Error('Reputation contract not initialized or no signer available');
    }

    const tx = await this.reputationContract.addScore(
      userAddress,
      points,
      category,
      proofURI
    );
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async getReputation(userAddress: string) {
    if (!this.reputationContract) {
      throw new Error('Reputation contract not initialized');
    }

    const score = await this.reputationContract.getScore(userAddress);
    const tier = await this.reputationContract.getTier(userAddress);

    return {
      totalScore: Number(score.totalScore),
      eventAttendance: Number(score.eventAttendance),
      qualityConnections: Number(score.qualityConnections),
      workshopParticipation: Number(score.workshopParticipation),
      credentialVerifications: Number(score.credentialVerifications),
      communityFeedback: Number(score.communityFeedback),
      tier: tier,
      lastUpdated: new Date(Number(score.lastUpdated) * 1000),
    };
  }

  // Attestation contract methods
  async createAttestation(
    subjectAddress: string,
    attestationType: number,
    claim: string,
    proofHash: string,
    proofURI: string,
    expiresAt?: Date
  ) {
    if (!this.attestationContract || !this.signer) {
      throw new Error('Attestation contract not initialized or no signer available');
    }

    const expiresAtTimestamp = expiresAt ? Math.floor(expiresAt.getTime() / 1000) : 0;

    const tx = await this.attestationContract.createAttestation(
      subjectAddress,
      attestationType,
      claim,
      proofHash,
      proofURI,
      expiresAtTimestamp
    );

    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log: any) => log.eventName === 'AttestationCreated'
    );

    return {
      txHash: receipt.hash,
      attestationId: event?.args?.id ? Number(event.args.id) : null,
    };
  }

  async revokeAttestation(attestationId: number) {
    if (!this.attestationContract || !this.signer) {
      throw new Error('Attestation contract not initialized or no signer available');
    }

    const tx = await this.attestationContract.revokeAttestation(attestationId);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }

  async getAttestation(attestationId: number) {
    if (!this.attestationContract) {
      throw new Error('Attestation contract not initialized');
    }

    const attestation = await this.attestationContract.attestations(attestationId);
    return {
      id: Number(attestation.id),
      subject: attestation.subject,
      attestationType: Number(attestation.attestationType),
      claim: attestation.claim,
      proofHash: attestation.proofHash,
      proofURI: attestation.proofURI,
      verifier: attestation.verifier,
      timestamp: new Date(Number(attestation.timestamp) * 1000),
      expiresAt: attestation.expiresAt > 0
        ? new Date(Number(attestation.expiresAt) * 1000)
        : null,
      revoked: attestation.revoked,
    };
  }

  async getUserAttestations(userAddress: string): Promise<number[]> {
    if (!this.attestationContract) return [];
    const attestationIds = await this.attestationContract.getUserAttestations(
      userAddress
    );
    return attestationIds.map((id: bigint) => Number(id));
  }

  async isAttestationValid(attestationId: number): Promise<boolean> {
    if (!this.attestationContract) return false;
    return await this.attestationContract.isValid(attestationId);
  }

  // Utility methods
  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}

// Export singleton instance
export const contractService = new ContractService();
export default contractService;
