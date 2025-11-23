import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '../api/services';
import { useMatchStore } from '../stores/match-store';

export function useMatches(eventId: string) {
  const { setMatches, setLoading, setError } = useMatchStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', eventId],
    queryFn: () => matchService.getMatches(eventId),
    enabled: !!eventId,
    onSuccess: (data) => {
      setMatches(data.matches);
    },
    onError: (error: any) => {
      setError(error.message);
    },
  });

  return {
    matches: data?.matches || [],
    isLoading,
    error,
  };
}

export function useMarkViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.markViewed(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

export function useMarkContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => matchService.markContacted(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
