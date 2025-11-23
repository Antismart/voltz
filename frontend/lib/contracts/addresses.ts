// Deployed contract addresses on 0G Testnet (Chain ID: 16602)
export const CONTRACT_ADDRESSES = {
  VoltzProfile: '0xD6C3cda3BB6054aFa5bf1C1e82ac169DB4126E8c',
  VoltzEvent: '0x18D8916de8E77481B4D64Fdd7516771392044232',
  VoltzReputation: '0xd6f13C1E1BCFEa019C9d3e5D381eF07c09c00DD4',
  VoltzAttestation: '0x580F764775Ad08FB3DE78cB3d923530DB8734089',
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;
