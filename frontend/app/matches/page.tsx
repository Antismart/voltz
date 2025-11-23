'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '../dashboard/layout';
import { matchService, eventService } from '@/lib/api/services';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Match, Event } from '@/lib/types';

export default function MatchesPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'connected'>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedEventId) {
      fetchMatches(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const myEvents = await eventService.getMyEvents().catch(() => []);
      setEvents(myEvents);

      if (myEvents.length > 0) {
        setSelectedEventId(myEvents[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await matchService.getMatches(eventId);
      setMatches(data.matches || []);
      if (data.matches && data.matches.length > 0) {
        setSelectedMatch(data.matches[0]);
      }
    } catch (err: any) {
      console.error('Error fetching matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (matchId: string) => {
    try {
      await matchService.markContacted(matchId);
      // Update local state
      setMatches(prev =>
        prev.map(m =>
          m.id === matchId ? { ...m, isConnected: true } : m
        )
      );
    } catch (err: any) {
      console.error('Error connecting:', err);
    }
  };

  const handleMarkViewed = async (matchId: string) => {
    try {
      await matchService.markViewed(matchId);
    } catch (err: any) {
      console.error('Error marking viewed:', err);
    }
  };

  const filteredMatches = activeTab === 'all'
    ? matches
    : matches.filter(m => m.isConnected);

  const stats = {
    total: matches.length,
    connected: matches.filter(m => m.isConnected).length,
    avgScore: matches.length > 0
      ? Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length)
      : 0,
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Failed to load matches</h3>
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
          <h1 className="text-2xl md:text-3xl font-bold">Matches</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            AI-powered connections based on your profile and goals
          </p>
        </div>

        {/* Event Selector */}
        {events.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex gap-2">
                  {events.map((event) => (
                    <Button
                      key={event.id}
                      variant={selectedEventId === event.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedEventId(event.id)}
                      className="whitespace-nowrap"
                    >
                      {event.title}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Total Matches
                  </p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold">{stats.total}</h3>
                </div>
                <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Connections Made
                  </p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold">{stats.connected}</h3>
                </div>
                <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">
                    Avg Match Score
                  </p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold">{stats.avgScore}%</h3>
                </div>
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <Skeleton className="h-96 w-full" />
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : matches.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-base md:text-lg font-semibold">No matches yet</h3>
                <p className="text-sm text-muted-foreground">
                  Register for events to get AI-powered matches
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Matches List */}
            <div className="space-y-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="all">
                    All
                    {stats.total > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stats.total}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="connected">
                    Connected
                    {stats.connected > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {stats.connected}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {filteredMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedMatch?.id === match.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => {
                        setSelectedMatch(match);
                        handleMarkViewed(match.id);
                      }}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0">
                            <AvatarImage src={match.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                              {match.user.username?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm md:text-base truncate">
                                {match.user.username || 'Anonymous User'}
                              </h4>
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                {match.score}%
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">
                              {match.user.profileType}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {match.commonInterests.slice(0, 2).map((interest, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Match Details */}
            {selectedMatch && (
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardContent className="p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 pb-6 border-b">
                      <Avatar className="h-16 w-16 md:h-20 md:w-20">
                        <AvatarImage src={selectedMatch.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-xl md:text-2xl text-white">
                          {selectedMatch.user.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-bold truncate">
                              {selectedMatch.user.username || 'Anonymous User'}
                            </h2>
                            <p className="text-sm md:text-base text-muted-foreground">
                              {selectedMatch.user.profileType}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-base md:text-lg px-3 md:px-4 py-1 md:py-2 shrink-0">
                            <Sparkles className="mr-2 h-4 w-4" />
                            {selectedMatch.score}% Match
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* AI Explanation */}
                    {selectedMatch.explanation && (
                      <div className="py-4 border-b">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 text-sm md:text-base">Why this match?</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedMatch.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    {selectedMatch.user.bio && (
                      <div className="py-4 border-b">
                        <h4 className="font-semibold mb-2 text-sm md:text-base">About</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedMatch.user.bio}
                        </p>
                      </div>
                    )}

                    {/* Common Interests */}
                    {selectedMatch.commonInterests.length > 0 && (
                      <div className="py-4 border-b">
                        <h4 className="font-semibold mb-3 text-sm md:text-base">
                          Common Interests ({selectedMatch.commonInterests.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMatch.commonInterests.map((interest, idx) => (
                            <Badge key={idx} variant="secondary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Skills */}
                    {selectedMatch.commonSkills.length > 0 && (
                      <div className="py-4 border-b">
                        <h4 className="font-semibold mb-3 text-sm md:text-base">
                          Common Skills ({selectedMatch.commonSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMatch.commonSkills.map((skill, idx) => (
                            <Badge key={idx} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-6 flex flex-col sm:flex-row gap-3">
                      {selectedMatch.isConnected ? (
                        <>
                          <Button variant="gradient" className="flex-1" asChild>
                            <Link href="/messages">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </Link>
                          </Button>
                          <Button variant="outline" className="flex-1 sm:flex-none">
                            View Profile
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="gradient"
                            className="flex-1"
                            onClick={() => handleConnect(selectedMatch.id)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Connect
                          </Button>
                          <Button variant="outline" className="flex-1 sm:flex-none">
                            View Profile
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
