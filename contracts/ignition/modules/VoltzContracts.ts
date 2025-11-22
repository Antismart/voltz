import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Voltz Contracts Deployment Module
 * Deploys all core contracts in the correct order
 */
const VoltzModule = buildModule("VoltzModule", (m) => {
  // Deploy VoltzProfile first (no dependencies)
  const profile = m.contract("VoltzProfile", []);

  // Deploy VoltzEvent (depends on VoltzProfile)
  const event = m.contract("VoltzEvent", [profile]);

  // Deploy VoltzReputation (independent)
  const reputation = m.contract("VoltzReputation", []);

  // Deploy VoltzAttestation (independent)
  const attestation = m.contract("VoltzAttestation", []);

  return { profile, event, reputation, attestation };
});

export default VoltzModule;
