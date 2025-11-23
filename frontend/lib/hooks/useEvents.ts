import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../api/services';
import { useEventStore } from '../stores/event-store';

export function useEvents(params?: { status?: string; page?: number; limit?: number }) {
  const queryClient = useQueryClient();
  const { setEvents, setLoading, setError } = useEventStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', params],
    queryFn: () => eventService.list(params),
    onSuccess: (data) => {
      setEvents(data.items);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  return {
    events: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
  };
}

export function useEvent(id: string) {
  const { setSelectedEvent, setLoading, setError } = useEventStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getById(id),
    enabled: !!id,
    onSuccess: (data) => {
      setSelectedEvent(data);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  return {
    event: data,
    isLoading,
    error,
  };
}

export function useMyEvents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myEvents'],
    queryFn: () => eventService.getMyEvents(),
  });

  return {
    events: data || [],
    isLoading,
    error,
  };
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, goals }: { eventId: string; goals: string }) =>
      eventService.register(eventId, goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['myEvents'] });
    },
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventService.checkIn(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof eventService.create>[0]) =>
      eventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
