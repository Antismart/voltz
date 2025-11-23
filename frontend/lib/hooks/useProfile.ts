import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../api/services';
import { useUserStore } from '../stores/user-store';

export function useProfile(address?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile', address],
    queryFn: () => address ? profileService.getByAddress(address) : profileService.getMe(),
  });

  return {
    profile: data,
    isLoading,
    error,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useUserStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof profileService.update>[0]) =>
      profileService.update(data),
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof profileService.create>[0]) =>
      profileService.create(data),
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
