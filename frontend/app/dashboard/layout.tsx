'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log('=== Dashboard Layout ===');
    console.log('Privy ready:', ready);
    console.log('Authenticated:', authenticated);
    console.log('Has checked:', hasChecked);

    // In demo mode, always allow access
    if (DEMO_MODE) {
      setIsChecking(false);
      setHasChecked(true);
      return;
    }

    // Wait for Privy to be ready before checking auth
    if (!ready) {
      console.log('⏳ Waiting for Privy to initialize...');
      return;
    }

    // Only check auth once, when Privy becomes ready
    if (!hasChecked) {
      console.log('🔍 First auth check starting...');
      console.log('📊 Current auth state:', { authenticated, ready });
      
      // Give MORE time for auth state to stabilize after navigation
      const checkTimer = setTimeout(() => {
        console.log('🔍 Performing authentication check NOW...');
        console.log('📊 Auth state after wait:', { authenticated, ready });
        setIsChecking(false);
        setHasChecked(true);
        
        if (authenticated) {
          console.log('✅ User is authenticated, rendering dashboard');
        } else {
          console.log('❌ Not authenticated after waiting, redirecting to landing page');
          router.replace('/');
        }
      }, 1500); // Wait 1.5 seconds for auth to fully stabilize

      return () => clearTimeout(checkTimer);
    } else {
      // Already checked, just update loading state
      setIsChecking(false);
      
      // If user logs out while on dashboard, redirect
      if (!authenticated) {
        console.log('⚠️ User logged out, redirecting...');
        router.replace('/');
      }
    }
  }, [authenticated, ready, hasChecked, router]);

  // In demo mode, always show the layout
  if (DEMO_MODE) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  // Show loading state while Privy initializes or while checking auth
  if (!ready || isChecking || !hasChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg text-muted-foreground">
            {!ready ? 'Initializing...' : 'Verifying authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If we've checked and user is not authenticated, show loading while redirecting
  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and ready, show the dashboard
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
