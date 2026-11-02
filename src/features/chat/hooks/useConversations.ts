import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversations } from '@/services/chatService';
import { upsertConversation } from '../utils/conversationStorage';
import { formatMessageTime } from '@/utils/formatDate';
import type { ConversationResponse } from '@/types';

const QUERY_KEY = ['chat', 'conversations'] as const;

/**
 * Fetches the user's conversation list from GET /api/v1/chat/conversations.
 *
 * On success, each conversation is also synced to localStorage so the
 * ConversationList can render names and avatars even before the next API call.
 */
export function useConversations() {
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [allItems, setAllItems] = useState<ConversationResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const { isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: [...QUERY_KEY, cursor],
    queryFn: async () => {
      const data = await getConversations(cursor, 15);

      // Sync each conversation to localStorage so names/avatars persist
      for (const conv of data.items) {
        upsertConversation({
          userId: conv.receiverID,
          name: conv.receiverName,
          avatar: conv.receiverAvatarUrl ?? undefined,
          lastMessage: conv.lastMessage,
          lastMessageTime: formatMessageTime(conv.lastMessageTime),
        });
      }

      setAllItems((prev) => {
        // Merge new items without duplicates (keyed by receiverID)
        const existingIds = new Set(prev.map((c) => c.receiverID));
        const fresh = data.items.filter((c) => !existingIds.has(c.receiverID));
        return cursor === undefined ? data.items : [...prev, ...fresh];
      });

      setHasMore(data.hasMore);
      return data;
    },
    staleTime: 30_000, // 30 seconds
  });

  /** Load the next page of conversations. */
  const loadMore = useCallback(() => {
    if (!hasMore || isFetching) return;
    const lastItem = allItems[allItems.length - 1];
    if (lastItem) {
      setCursor(lastItem.lastMessageId);
    }
  }, [hasMore, isFetching, allItems]);

  /** Invalidate and re-fetch from the beginning (e.g. after sending a new message). */
  const refresh = useCallback(() => {
    setCursor(undefined);
    setAllItems([]);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  return {
    conversations: allItems,
    isLoading,
    isError,
    error,
    isFetching,
    hasMore,
    loadMore,
    refresh,
    refetch,
  };
}
