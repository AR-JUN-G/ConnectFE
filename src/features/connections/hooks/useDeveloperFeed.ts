import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, sendConnectionRequest } from '@/services/connectionService';
import { useNotify } from '@/hooks/useToast';
import { ApiError } from '@/api/apiError';

export const FEED_QUERY_KEY = (page: number, size: number) =>
  ['connections', 'feed', page, size] as const;

export function useDeveloperFeed(initialPage = 0, pageSize = 12) {
  const [page, setPage] = useState(initialPage);
  const [sentRequestIds, setSentRequestIds] = useState<Set<number>>(new Set());
  const notify = useNotify();
  const queryClient = useQueryClient();

  const feedQuery = useQuery({
    queryKey: FEED_QUERY_KEY(page, pageSize),
    queryFn: () => getFeed(page, pageSize),
  });

  const sendMutation = useMutation({
    mutationFn: (receiverId: number) => sendConnectionRequest(receiverId),
    onSuccess: (_, receiverId) => {
      setSentRequestIds((prev) => new Set(prev).add(receiverId));
      notify.success('Connection request sent!');
      // Invalidate feed so next page/refresh reflects change
      void queryClient.invalidateQueries({ queryKey: ['connections', 'feed'] });
    },
    onError: (error: unknown, receiverId) => {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          // Already sent or already connected
          setSentRequestIds((prev) => new Set(prev).add(receiverId));
          notify.info(error.message || 'Connection request already exists.');
          return;
        }
        notify.error(error.message);
      } else {
        notify.error('Failed to send connection request.');
      }
    },
  });

  const handleSendRequest = useCallback(
    (receiverId: number) => {
      return sendMutation.mutateAsync(receiverId);
    },
    [sendMutation],
  );

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(0, p - 1));

  return {
    developers: feedQuery.data ?? [],
    page,
    setPage,
    nextPage,
    prevPage,
    isLoading: feedQuery.isLoading,
    isFetching: feedQuery.isFetching,
    isError: feedQuery.isError,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
    sendRequest: handleSendRequest,
    isSending: (id: number) =>
      sendMutation.isPending && sendMutation.variables === id,
    hasSent: (id: number) => sentRequestIds.has(id),
  };
}
