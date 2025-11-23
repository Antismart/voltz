'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config as wagmiConfig } from '@/lib/wagmi';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!privyAppId || privyAppId === 'your_privy_app_id_here') {
      setShowSetup(!DEMO_MODE);
    }
  }, [privyAppId]);

  if (DEMO_MODE) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
          🎨 Demo Mode - Authentication disabled
        </div>
        <div className="pt-10">{children}</div>
        <Toaster />
      </QueryClientProvider>
    );
  }

  if (showSetup || !privyAppId || privyAppId === 'your_privy_app_id_here') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
        <div className="max-w-2xl w-full rounded-xl border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
            <h1 className="text-3xl font-bold">Setup Required</h1>
            <p className="mt-2 text-muted-foreground">
              Configure your environment variables to continue
            </p>
          </div>
          <div className="space-y-4 rounded-lg bg-muted p-6">
            <p className="text-sm">Add to <code className="text-primary">frontend/.env.local</code>:</p>
            <code className="block rounded bg-background p-3 text-sm">
              NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ['wallet', 'email', 'google', 'twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6',
        },
        // @ts-ignore - Privy v3 embedded wallet config
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {/* @ts-ignore - React version mismatch */}
          {children}
          <Toaster />
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
