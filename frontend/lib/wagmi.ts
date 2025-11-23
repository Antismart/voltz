import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// 0G Chain configuration
export const ogChain = {
  id: 16600,
  name: '0G Chain Testnet',
  network: '0g-testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.0g.ai'] },
    public: { http: ['https://rpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://explorer-testnet.0g.ai' },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [ogChain, mainnet, sepolia],
  transports: {
    [ogChain.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
