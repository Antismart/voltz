'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '../dashboard/layout';
import { eventService } from '@/lib/api/services';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Event } from '@/lib/types';

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'registered' | 'past'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const [all, registered] = await Promise.all([
        eventService.list({ status: 'UPCOMING' }).catch(() => ({ items: [] })),
        eventService.getMyEvents().catch(() => []),
      ]);

      setAllEvents(all.items || all);
      setMyEvents(registered || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = allEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const registeredEvents = myEvents.filter(e => e.status === 'UPCOMING' || e.status === 'ONGOING');
  const pastEvents = myEvents.filter(e => e.status === 'COMPLETED');

  const renderEventCard = (event: Event, index: number) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="card-hover h-full overflow-hidden">
        {/* Event Image */}
        <div className="h-40 md:h-48 bg-gradient-to-br from-purple-500 to-blue-500 relative">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
          {event.isRegistered && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur">
                Registered
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 md:p-6">
          <div className="mb-3 md:mb-4 flex items-start justify-between gap-2">
            <h3 className="text-lg md:text-xl font-semibold line-clamp-2 flex-1">
              {event.title}
            </h3>
          </div>

          <p className="mb-3 md:mb-4 text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>

          <div className="mb-3 md:mb-4 space-y-2 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {event.registered} / {event.capacity} registered
              </span>
            </div>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {event.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Button className="w-full" size="sm" asChild>
            <Link href={`/events/${event.id}`}>View Details</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEmptyState = (icon: any, title: string, description: string, action?: React.ReactNode) => (
    <div className="text-center py-12">
      {icon}
      <h3 className="mt-4 text-base md:text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Failed to load events</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchEvents} variant="outline">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Events</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Discover and register for upcoming events
            </p>
          </div>
          <Button variant="gradient" className="w-full sm:w-auto" asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="registered">
              Registered
              {registeredEvents.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {registeredEvents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              renderEmptyState(
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />,
                searchQuery ? 'No events found' : 'No events available',
                searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Check back later for upcoming events',
                !searchQuery && (
                  <Button variant="outline" asChild>
                    <Link href="/events/create">Create an Event</Link>
                  </Button>
                )
              )
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event, index) => renderEventCard(event, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered" className="mt-6">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            ) : registeredEvents.length === 0 ? (
              renderEmptyState(
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />,
                'No registered events',
                'Register for events to see them here',
                <Button variant="outline" onClick={() => setActiveTab('all')}>
                  Browse Events
                </Button>
              )
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {registeredEvents.map((event, index) => renderEventCard(event, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[400px] w-full" />
                ))}
              </div>
            ) : pastEvents.length === 0 ? (
              renderEmptyState(
                <Clock className="mx-auto h-12 w-12 text-muted-foreground" />,
                'No past events',
                'Your attended events will appear here'
              )
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event, index) => renderEventCard(event, index))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
