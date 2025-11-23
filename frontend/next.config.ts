import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Fix for crypto libraries in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // External packages that cause issues
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
  // Allow loading from external domains (for Privy)
  images: {
    domains: ['auth.privy.io'],
  },
  // Disable static optimization for pages that use hooks
  experimental: {
    optimizePackageImports: ['@privy-io/react-auth'],
  },
};

export default nextConfig;
