import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          evmVersion: "cancun", // 0G Chain supports Cancun
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          evmVersion: "cancun",
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
          metadata: {
            bytecodeHash: "none",
          },
        },
      },
    },
  },
  networks: {
    // Local development networks
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },

    // 0G Chain Testnet (Galileo)
    testnet: {
      type: "http",
      chainType: "l1",
      url: process.env.OG_CHAIN_RPC_URL || "https://evmrpc-testnet.0g.ai",
      accounts: process.env.OG_PRIVATE_KEY ? [process.env.OG_PRIVATE_KEY] : [],
      chainId: 16602,
    },

    // 0G Chain Mainnet
    mainnet: {
      type: "http",
      chainType: "l1",
      url: process.env.OG_CHAIN_RPC_URL_MAINNET || "https://evmrpc.0g.ai",
      accounts: process.env.OG_PRIVATE_KEY ? [process.env.OG_PRIVATE_KEY] : [],
      chainId: 16661,
    },

    // Fallback testnet
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // @ts-ignore - etherscan config for hardhat-verify
  etherscan: {
    apiKey: {
      testnet: process.env.OG_EXPLORER_API_KEY || "placeholder",
      mainnet: process.env.OG_EXPLORER_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "testnet",
        chainId: 16602,
        urls: {
          apiURL: "https://chainscan-galileo.0g.ai/open/api",
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/open/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};

export default defineConfig(config);
