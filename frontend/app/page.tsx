'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  MessageSquare,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Privacy-Preserving Identity',
    description:
      'Verify credentials with zero-knowledge proofs. No personal data exposed.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description:
      'Decentralized AI matches you with attendees based on verified skills and goals.',
  },
  {
    icon: MessageSquare,
    title: 'Decentralized Messaging',
    description:
      'End-to-end encrypted XMTP messaging that persists across events.',
  },
  {
    icon: Award,
    title: 'Verifiable Reputation',
    description:
      'Build on-chain reputation with cryptographic proofs of your contributions.',
  },
  {
    icon: Users,
    title: 'Smart Networking',
    description:
      'AI analyzes all attendees and recommends the best connections for you.',
  },
  {
    icon: Zap,
    title: 'Infinite Scale',
    description:
      '0G infrastructure supports events with 10,000+ attendees seamlessly.',
  },
];

const stats = [
  { value: '10K+', label: 'Connections Made' },
  { value: '500+', label: 'Events Hosted' },
  { value: '95%', label: 'Match Accuracy' },
  { value: '100%', label: 'Privacy Protected' },
];

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function Home() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const [previousAuth, setPreviousAuth] = useState(false);

  const handleGetStarted = async () => {
    if (DEMO_MODE) {
      // In demo mode, just navigate to dashboard
      router.push('/dashboard');
      return;
    }

    console.log('=== Get Started Clicked ===');
    console.log('Privy ready:', ready);
    console.log('Authenticated:', authenticated);

    if (!ready) {
      console.log('⚠️ Privy not ready yet, waiting...');
      return;
    }

    if (authenticated) {
      // User is already authenticated, redirect to dashboard
      console.log('✅ User already authenticated, going to dashboard');
      router.push('/dashboard');
      return;
    }

    // User not authenticated, show Privy login modal
    console.log('🔐 Opening Privy login modal...');
    
    try {
      // Call login - this opens the modal immediately
      login();
      console.log('🔐 Privy modal opened (login() called)');
      // The modal is now open, user will complete login there
      // The useEffect will handle the redirect after auth completes
    } catch (error) {
      console.error('❌ Login failed:', error);
    }
  };

  // Redirect to dashboard after successful authentication
  useEffect(() => {
    console.log('Auth Effect:', { authenticated, ready, previousAuth });
    
    // Detect when authentication changes from false to true
    if (authenticated && ready && !previousAuth) {
      // User just logged in!
      console.log('✅ Authentication successful! Redirecting to dashboard...');
      setPreviousAuth(true);
      
      // Small delay to ensure auth is fully set
      const timer = setTimeout(() => {
        console.log('🚀 Navigating to dashboard now...');
        router.push('/dashboard');
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Update previous auth state
    if (authenticated !== previousAuth) {
      setPreviousAuth(authenticated);
    }
  }, [authenticated, ready, previousAuth, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
            <span className="text-xl font-bold">Voltz</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={handleGetStarted} 
              variant="gradient"
              disabled={!ready}
            >
              {!ready ? 'Loading...' : 'Get Started'}
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Networking on 0G Infrastructure
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 max-w-4xl text-5xl font-bold leading-tight lg:text-7xl"
          >
            Make{' '}
            <span className="text-gradient">Meaningful Connections</span>{' '}
            at Every Event
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 max-w-2xl text-lg text-muted-foreground lg:text-xl"
          >
            Voltz leverages AI and blockchain to solve the cold start problem at
            conferences and hackathons. Get matched with the right people based on
            verified skills and shared goals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="xl"
              variant="gradient"
              onClick={handleGetStarted}
              className="gap-2"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline">
              View Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lg:text-5xl">
            Everything You Need
          </h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Powered by cutting-edge Web3 infrastructure
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-hover h-full">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lg:text-5xl">How It Works</h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Get matched in 3 simple steps
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl space-y-8">
          {[
            {
              step: '01',
              title: 'Create Your Profile',
              description:
                'Connect your wallet and verify credentials with zero-knowledge proofs. Add your skills, interests, and networking goals.',
            },
            {
              step: '02',
              title: 'Register for Events',
              description:
                'Browse upcoming events and register. Our AI analyzes all attendees to find your perfect matches.',
            },
            {
              step: '03',
              title: 'Connect & Network',
              description:
                'Get AI-powered match recommendations, send messages via XMTP, and build verifiable on-chain reputation.',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="flex items-start gap-6 p-8">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-2xl font-bold text-white">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold lg:text-5xl">
            Built on Web3 Infrastructure
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Powered by the best protocols in the ecosystem
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            {['0G Chain', 'vlayer', 'XMTP', 'Privy', '0G Storage', 'vouch'].map(
              (tech, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-background/50 px-6 py-3 font-semibold"
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 p-12 text-center text-white"
        >
          <h2 className="mb-4 text-3xl font-bold lg:text-5xl">
            Ready to Transform Your Event Experience?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of professionals making meaningful connections at events
          </p>
          <Button
            size="xl"
            variant="secondary"
            onClick={handleGetStarted}
            className="gap-2"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
            <span className="text-lg font-bold text-foreground">Voltz</span>
          </div>
          <p>
            Built with{' '}
            <span className="text-red-500">&hearts;</span> for the decentralized
            future
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} Voltz. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
