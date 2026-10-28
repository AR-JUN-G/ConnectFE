import { useState, useEffect, useCallback, useRef } from 'react';
import { getChatHistory, sendMessage as sendChatMessage } from '@/services/chatService';
import { subscribeToIncomingMessages } from '@/websocket/chatSocketService';
import { stompClientManager } from '@/websocket/stompClient';
import type { ChatMessage } from '@/types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotify } from '@/hooks/useToast';
import { ApiError } from '@/api/apiError';
import { upsertConversation } from '../utils/conversationStorage';
import { formatMessageTime } from '@/utils/formatDate';

export function useChat(
  otherUserId: number,
  recipientName?: string,
  recipientAvatar?: string,
) {
  const { currentUser } = useAuth();
  const notify = useNotify();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>(
    stompClientManager.getState(),
  );

  const pageSize = 30;
  // Ref to track message IDs currently in state to prevent duplicates
  const messageIdsRef = useRef<Set<number>>(new Set());

  // Keep messageIdsRef in sync with messages state
  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((m) => m.id));
  }, [messages]);

  // Track WS connection state
  useEffect(() => {
    const unsubscribe = stompClientManager.onStateChange((state) => {
      setWsStatus(state);
    });
    return () => unsubscribe();
  }, []);

  // Initial history fetch
  const fetchInitialHistory = useCallback(async () => {
    if (!otherUserId || isNaN(otherUserId)) return;

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const history = await getChatHistory({ otherUserId }, pageSize);
      // Backend returns messages in chronological order (oldest first)
      setMessages(history);
      messageIdsRef.current = new Set(history.map((m) => m.id));
      setHasMore(history.length >= pageSize);

      if (history.length > 0) {
        const last = history[history.length - 1];
        upsertConversation({
          userId: otherUserId,
          name: recipientName || `Developer #${otherUserId}`,
          avatar: recipientAvatar,
          lastMessage: last.content,
          lastMessageTime: formatMessageTime(last.createdAt),
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setHistoryError(err.message);
      } else {
        setHistoryError('Failed to load conversation history.');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, [otherUserId, pageSize, recipientName, recipientAvatar]);

  useEffect(() => {
    void fetchInitialHistory();
  }, [fetchInitialHistory]);

  // Load older messages (cursor-based pagination going backward in time)
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMore || messages.length === 0) return;

    setIsLoadingOlder(true);

    try {
      // Oldest message is at index 0 because messages are sorted chronologically
      const oldestMessage = messages[0];

      const olderMessages = await getChatHistory(
        {
          otherUserId,
          lastSeenTime: oldestMessage.createdAt,
          lastSeenId: oldestMessage.id,
        },
        pageSize,
      );

      if (olderMessages.length < pageSize) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        // Prepend non-duplicate older messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOlder = olderMessages.filter((m) => !existingIds.has(m.id));
          return [...newOlder, ...prev];
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        notify.error(err.message);
      } else {
        notify.error('Failed to load older messages.');
      }
    } finally {
      setIsLoadingOlder(false);
    }
  }, [isLoadingOlder, hasMore, messages, otherUserId, pageSize, notify]);

  // Subscribe to real-time incoming messages via WebSocket
  useEffect(() => {
    if (!otherUserId) return;

    const unsubscribe = subscribeToIncomingMessages((incoming: ChatMessage) => {
      // Check if incoming message belongs to this conversation
      const isFromOther = incoming.senderId === otherUserId;
      const isToOther = incoming.receiverId === otherUserId;

      if (!isFromOther && !isToOther) {
        return; // belongs to another conversation
      }

      // Check deduplication
      if (messageIdsRef.current.has(incoming.id)) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) {
          return prev;
        }
        return [...prev, incoming];
      });

      upsertConversation({
        userId: otherUserId,
        name: recipientName || `Developer #${otherUserId}`,
        avatar: recipientAvatar,
        lastMessage: incoming.content,
        lastMessageTime: formatMessageTime(incoming.createdAt),
      });
    });

    return () => {
      unsubscribe();
    };
  }, [otherUserId, recipientName, recipientAvatar]);

  // Send message via REST
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isSending) return;

      setIsSending(true);

      try {
        const savedMessage = await sendChatMessage({
          receiverId: otherUserId,
          content: trimmed,
        });

        // Append saved message and update ID set
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMessage.id)) {
            return prev;
          }
          return [...prev, savedMessage];
        });

        upsertConversation({
          userId: otherUserId,
          name: recipientName || `Developer #${otherUserId}`,
          avatar: recipientAvatar,
          lastMessage: savedMessage.content,
          lastMessageTime: formatMessageTime(savedMessage.createdAt),
        });

        return savedMessage;
      } catch (err) {
        if (err instanceof ApiError) {
          notify.error(err.message);
        } else {
          notify.error('Failed to send message.');
        }
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [otherUserId, isSending, notify, recipientName, recipientAvatar],
  );

  return {
    messages,
    currentUser,
    isLoadingHistory,
    isLoadingOlder,
    isSending,
    hasMore,
    historyError,
    wsStatus,
    sendMessage,
    loadOlderMessages,
    retryHistory: fetchInitialHistory,
  };
}
