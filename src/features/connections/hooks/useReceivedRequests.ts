import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReceivedRequests, reviewConnectionRequest } from '@/services/connectionService';
import { useNotify } from '@/hooks/useToast';
import type { ReviewAction } from '@/types';
import { ApiError } from '@/api/apiError';

export const RECEIVED_REQUESTS_KEY = ['connections', 'received'] as const;

export function useReceivedRequests() {
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);

  const requestsQuery = useQuery({
    queryKey: RECEIVED_REQUESTS_KEY,
    queryFn: getReceivedRequests,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      requestId,
      action,
    }: {
      requestId: number;
      action: ReviewAction;
    }) => reviewConnectionRequest(requestId, action),
    onMutate: ({ requestId }) => {
      setPendingActionId(requestId);
    },
    onSuccess: (_, { requestId, action }) => {
      notify.success(
        action === 'ACCEPT'
          ? 'Connection request accepted!'
          : 'Connection request rejected.',
      );
      // Remove reviewed request from cached data immediately
      queryClient.setQueryData(
        RECEIVED_REQUESTS_KEY,
        (prev: unknown) => {
          if (!Array.isArray(prev)) return [];
          return prev.filter((item) => item.id !== requestId);
        },
      );
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        notify.error(error.message);
      } else {
        notify.error('Failed to review request. Please try again.');
      }
    },
    onSettled: () => {
      setPendingActionId(null);
    },
  });

  const handleReview = useCallback(
    (requestId: number, action: ReviewAction) => {
      return reviewMutation.mutateAsync({ requestId, action });
    },
    [reviewMutation],
  );

  return {
    requests: requestsQuery.data ?? [],
    isLoading: requestsQuery.isLoading,
    isError: requestsQuery.isError,
    error: requestsQuery.error,
    refetch: requestsQuery.refetch,
    reviewRequest: handleReview,
    isProcessing: (id: number) => pendingActionId === id,
  };
}
