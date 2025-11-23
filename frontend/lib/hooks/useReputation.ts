import { useQuery } from '@tanstack/react-query';
import { reputationService } from '../api/services';

export function useReputation(address?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reputation', address],
    queryFn: () => reputationService.getReputation(address),
  });

  return {
    reputation: data,
    isLoading,
    error,
  };
}

export function useReputationHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['reputationHistory'],
    queryFn: () => reputationService.getHistory(),
  });

  return {
    history: data || [],
    isLoading,
    error,
  };
}
