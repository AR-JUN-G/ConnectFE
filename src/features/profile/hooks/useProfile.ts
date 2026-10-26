import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/services/userService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotify } from '@/hooks/useToast';
import { ApiError } from '@/api/apiError';

export const PROFILE_QUERY_KEY = ['user', 'profile'] as const;

export function useProfile() {
  const { refreshProfile } = useAuth();
  const notify = useNotify();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: async (data) => {
      notify.success('Profile updated successfully');
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      await refreshProfile();
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        notify.error(error.message);
      } else {
        notify.error('Failed to update profile. Please try again.');
      }
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
