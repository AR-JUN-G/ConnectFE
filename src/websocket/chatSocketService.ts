import { stompClientManager } from './stompClient';
import { WS_ENDPOINTS } from '@/constants/api';
import type { ChatMessage, ChatSendRequest } from '@/types';

type MessageHandler = (message: ChatMessage) => void;

/**
 * Subscribe to the user's personal incoming message queue.
 * Returns an unsubscribe function — call it on cleanup to avoid memory leaks.
 *
 * If the STOMP client is not yet connected, the subscription will be established
 * once the connection is ready via the onConnect callback.
 */
export function subscribeToIncomingMessages(
  handler: MessageHandler,
): () => void {
  const subscriptions: Array<{ unsubscribe: () => void }> = [];
  const handledMessageIds = new Set<number>();

  const onMessageFrame = (body: string) => {
    try {
      const message = JSON.parse(body) as ChatMessage;
      if (message.id && handledMessageIds.has(message.id)) {
        return; // deduplicate
      }
      if (message.id) {
        handledMessageIds.add(message.id);
        // keep set bounded
        if (handledMessageIds.size > 200) {
          const first = handledMessageIds.values().next().value;
          if (first !== undefined) handledMessageIds.delete(first);
        }
      }
      handler(message);
    } catch (err) {
      console.error('[ChatSocket] Failed to parse incoming message:', err);
    }
  };

  const subscribe = () => {
    const client = stompClientManager.getClient();
    if (!client?.connected) return;

    // Clear existing
    while (subscriptions.length > 0) {
      subscriptions.pop()?.unsubscribe();
    }

    const destinations = [
      WS_ENDPOINTS.DESTINATIONS.INCOMING_MESSAGES,
      WS_ENDPOINTS.DESTINATIONS.INCOMING_MESSAGE_SINGULAR,
    ];

    for (const dest of destinations) {
      try {
        const sub = client.subscribe(dest, (frame) => onMessageFrame(frame.body));
        subscriptions.push(sub);
      } catch {
        // ignore subscription errors for unmatched routes
      }
    }
  };

  // Subscribe immediately if already connected
  if (stompClientManager.isConnected()) {
    subscribe();
  }

  // Also listen for the connected state to handle late connections
  const removeStateListener = stompClientManager.onStateChange((state) => {
    if (state === 'connected' && subscriptions.length === 0) {
      subscribe();
    } else if (state === 'disconnected' || state === 'error') {
      subscriptions.length = 0;
    }
  });

  // Return cleanup function
  return () => {
    removeStateListener();
    while (subscriptions.length > 0) {
      subscriptions.pop()?.unsubscribe();
    }
  };
}

/**
 * Send a message via the STOMP destination /app/chat.send.
 *
 * Note: This destination does NOT return a response frame.
 * The message is delivered to the RECIPIENT's /user/queue/messages subscription.
 * Use REST POST /api/v1/chat/send to send messages and receive confirmation.
 *
 * This function is available for cases where WebSocket-only sending is preferred.
 */
export function sendMessageViaSocket(payload: ChatSendRequest): void {
  const client = stompClientManager.getClient();
  if (!client?.connected) {
    throw new Error('WebSocket is not connected. Cannot send message.');
  }

  client.publish({
    destination: WS_ENDPOINTS.DESTINATIONS.SEND_MESSAGE,
    body: JSON.stringify(payload),
  });
}
