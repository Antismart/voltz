import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useUserStore } from '../stores/user-store';
import { authService, profileService } from '../api/services';
import { useRouter } from 'next/navigation';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const DEMO_USER = {
  id: 'demo-user-1',
  address: '0x1234567890123456789012345678901234567890',
  email: 'demo@voltz.app',
  username: 'DemoUser',
  profileType: 'ATTENDEE' as const,
  profileNFTId: '1',
  avatar: undefined,
  bio: 'This is a demo profile. Connect your wallet to see your real data.',
  skills: ['React', 'TypeScript', 'Solidity', 'Smart Contracts'],
  interests: ['DeFi', 'NFTs', 'Web3', 'DAOs'],
  goals: ['Learn about ZK proofs', 'Build dApps', 'Network with developers'],
  socialLinks: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
    website: 'https://voltz.app',
  },
  credentials: [
    {
      id: '1',
      type: 'GITHUB' as const,
      verified: true,
      verifiedAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'TWITTER' as const,
      verified: false,
    },
  ],
  reputationScore: 850,
  tier: 'GOLD' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useAuth() {
  const { login, logout: privyLogout, authenticated, user: privyUser, ready } = usePrivy();
  const { user, setUser, clearUser, setLoading, setError } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      // In demo mode, set a demo user
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    if (authenticated && privyUser?.wallet?.address) {
      // Fetch user profile from backend
      const fetchUserProfile = async () => {
        try {
          setLoading(true);
          const profile = await profileService.getMe();
          setUser(profile);
        } catch (error: any) {
          console.error('Failed to fetch profile:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    } else if (!authenticated && ready) {
      clearUser();
    }
  }, [authenticated, privyUser, ready]);

  const handleLogin = async () => {
    if (DEMO_MODE) {
      console.log('Demo mode: Login not available');
      return;
    }
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    if (DEMO_MODE) {
      console.log('Demo mode: Logout not available');
      return;
    }
    try {
      await authService.logout();
      await privyLogout();
      clearUser();
      router.push('/');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  return {
    user: DEMO_MODE ? DEMO_USER : user,
    isAuthenticated: DEMO_MODE ? true : authenticated,
    isLoading: DEMO_MODE ? false : !ready,
    login: handleLogin,
    logout: handleLogout,
    address: DEMO_MODE ? DEMO_USER.address : privyUser?.wallet?.address,
  };
}
