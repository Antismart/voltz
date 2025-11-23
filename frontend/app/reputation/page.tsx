'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, TrendingUp, Trophy, Star, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../dashboard/layout';
import { reputationService } from '@/lib/api/services';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Reputation, ReputationHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';

export default function ReputationPage() {
  const { isAuthenticated, address } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [history, setHistory] = useState<ReputationHistory[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rep, hist] = await Promise.all([
        reputationService.getReputation().catch(() => null),
        reputationService.getHistory().catch(() => []),
      ]);

      setReputation(rep);
      setHistory(hist || []);
    } catch (err: any) {
      console.error('Error fetching reputation:', err);
      setError(err.message || 'Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = reputation?.totalPoints || 0;
  const tier = reputation?.tier || 'BRONZE';
  const nextTier = tier === 'BRONZE' ? 'SILVER' : tier === 'SILVER' ? 'GOLD' : tier === 'GOLD' ? 'PLATINUM' : null;
  const tierThresholds = { BRONZE: 0, SILVER: 100, GOLD: 500, PLATINUM: 1000 };
  const currentThreshold = tierThresholds[tier];
  const nextThreshold = nextTier ? tierThresholds[nextTier] : tierThresholds.PLATINUM;
  const pointsToNextTier = nextTier ? nextThreshold - totalPoints : 0;

  const breakdown = reputation ? [
    { category: 'Events', points: reputation.breakdown.events, color: 'bg-blue-500', percentage: 0 },
    { category: 'Connections', points: reputation.breakdown.connections, color: 'bg-purple-500', percentage: 0 },
    { category: 'Workshops', points: reputation.breakdown.workshops, color: 'bg-green-500', percentage: 0 },
    { category: 'Credentials', points: reputation.breakdown.credentials, color: 'bg-yellow-500', percentage: 0 },
  ].map(item => ({
    ...item,
    percentage: totalPoints > 0 ? Math.round((item.points / totalPoints) * 100) : 0,
  })) : [];

  const achievements = [
    {
      title: 'Early Adopter',
      description: 'Joined Voltz in the first month',
      icon: Star,
      unlocked: totalPoints >= 10,
    },
    {
      title: 'Social Butterfly',
      description: 'Made 50+ connections',
      icon: Trophy,
      unlocked: reputation?.breakdown.connections >= 50,
    },
    {
      title: 'Event Master',
      description: 'Attended 10+ events',
      icon: Award,
      unlocked: reputation?.breakdown.events >= 100,
    },
    {
      title: 'Knowledge Seeker',
      description: 'Attended 20+ workshops',
      icon: TrendingUp,
      unlocked: reputation?.breakdown.workshops >= 200,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full lg:col-span-2" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Failed to load reputation</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reputation</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your on-chain reputation and achievements
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Tier */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Current Reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary">
                    {totalPoints}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Points
                  </p>
                </div>
                <Badge variant="secondary" className="px-4 md:px-6 py-2 md:py-3 text-lg md:text-xl shrink-0">
                  <Award className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                  {tier} Tier
                </Badge>
              </div>

              {nextTier && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">
                      Progress to {nextTier}
                    </span>
                    <span className="font-medium">
                      {pointsToNextTier} points needed
                    </span>
                  </div>
                  <div className="h-2 md:h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{
                        width: `${((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rank */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 md:h-24 md:w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-2xl md:text-3xl font-bold text-white mb-4">
                  -
                </div>
                <p className="text-sm text-muted-foreground">
                  Ranking coming soon
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-green-500">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Keep building!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Points Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdown.length > 0 ? (
                <div className="space-y-4">
                  {breakdown.map((item, index) => (
                    <motion.div
                      key={item.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">
                          {item.points} pts ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Start participating in events to earn points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      achievement.unlocked
                        ? 'bg-accent'
                        : 'opacity-60 grayscale'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                          : 'bg-muted'
                      }`}
                    >
                      <achievement.icon
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          achievement.unlocked
                            ? 'text-white'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base truncate">{achievement.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="shrink-0 text-xs">Unlocked</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Award className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">{item.description}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">+{item.points} pts</Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-base md:text-lg font-semibold">No activity yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start attending events and making connections
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
