'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  ArrowRight,
  Clock,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { eventService, analyticsService, matchService } from '@/lib/api/services';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Event, Match } from '@/lib/types';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalConnections: 0,
    totalMatches: 0,
    reputationRank: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, eventsData] = await Promise.all([
        analyticsService.getStats().catch(() => ({
          totalEvents: 0,
          totalConnections: 0,
          totalMatches: 0,
          reputationRank: 0,
        })),
        eventService.getMyEvents().catch(() => []),
      ]);

      setStats(statsData);
      setUpcomingEvents(eventsData.slice(0, 3));

      // Fetch matches for the first upcoming event if available
      if (eventsData.length > 0 && eventsData[0]?.id) {
        const matchesData = await matchService.getMatches(eventsData[0].id).catch(() => ({ matches: [] }));
        setRecentMatches(matchesData.matches.slice(0, 3));
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      title: 'Upcoming Events',
      value: stats.totalEvents.toString(),
      change: `${upcomingEvents.length} registered`,
      icon: Calendar,
      color: 'text-blue-500',
      href: '/events',
    },
    {
      title: 'Connections',
      value: stats.totalConnections.toString(),
      change: 'Total made',
      icon: Users,
      color: 'text-purple-500',
      href: '/matches',
    },
    {
      title: 'Messages',
      value: stats.totalMatches.toString(),
      change: 'Conversations',
      icon: MessageSquare,
      color: 'text-green-500',
      href: '/messages',
    },
    {
      title: 'Reputation Rank',
      value: stats.reputationRank > 0 ? `#${stats.reputationRank}` : '-',
      change: 'Your rank',
      icon: Award,
      color: 'text-yellow-500',
      href: '/reputation',
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Here's what's happening with your network
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">
                        {stat.title}
                      </p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-2" />
                      ) : (
                        <h3 className="mt-2 text-2xl md:text-3xl font-bold">{stat.value}</h3>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`rounded-full bg-background p-2 md:p-3 ${stat.color} shrink-0`}>
                      <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl">Upcoming Events</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events" className="text-xs md:text-sm">
                  View All
                  <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-sm md:text-base font-semibold">No upcoming events</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Register for events to see them here
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="flex items-start gap-3 md:gap-4 rounded-lg border p-3 md:p-4 transition-colors hover:bg-accent">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm md:text-base truncate">{event.title}</h4>
                          <Badge
                            variant="default"
                            className="shrink-0 text-xs"
                          >
                            Registered
                          </Badge>
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 truncate">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                            <span className="truncate">{new Date(event.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl">Top Matches</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/matches" className="text-xs md:text-sm">
                  View All
                  <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : recentMatches.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-sm md:text-base font-semibold">No matches yet</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Register for events to get matched
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <Link key={match.id} href={`/matches`}>
                    <div className="flex items-start gap-3 md:gap-4 rounded-lg border p-3 md:p-4 transition-colors hover:bg-accent">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm md:text-lg font-bold text-white">
                        {match.user.username?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-sm md:text-base truncate">
                              {match.user.username || 'Anonymous User'}
                            </h4>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {match.user.profileType || 'User'}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            {match.score}% match
                          </Badge>
                        </div>
                        {match.explanation && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {match.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 md:py-6"
              asChild
            >
              <Link href="/events/create">
                <Calendar className="h-6 w-6 md:h-8 md:w-8" />
                <span className="text-sm md:text-base">Create Event</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 md:py-6"
              asChild
            >
              <Link href="/profile">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
                <span className="text-sm md:text-base">Update Profile</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 py-4 md:py-6"
              asChild
            >
              <Link href="/matches">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                <span className="text-sm md:text-base">Find Matches</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
