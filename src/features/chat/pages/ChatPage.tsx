import { useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { MessageSquare, ArrowUp, Users } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageInput } from '../components/MessageInput';
import { Loader } from '@/components/common/Loader';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants/routes';

interface LocationState {
  recipientName?: string;
  recipientAvatar?: string;
}

export function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const numericUserId = Number(userId);
  const isValidUserId = !isNaN(numericUserId) && numericUserId > 0;

  const {
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
    retryHistory,
  } = useChat(isValidUserId ? numericUserId : 0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  // Auto scroll to bottom when new messages arrive (if near bottom)
  useEffect(() => {
    if (!isLoadingOlder && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoadingOlder]);

  // Handle preserving scroll position when older messages are prepended
  const handleLoadOlder = async () => {
    if (!messagesContainerRef.current) return;
    prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
    await loadOlderMessages();
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const heightDiff =
          messagesContainerRef.current.scrollHeight - prevScrollHeightRef.current;
        messagesContainerRef.current.scrollTop += heightDiff;
      }
    });
  };

  if (!isValidUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid User</h2>
        <p className="text-sm text-gray-500 mb-4">
          The requested conversation does not exist or has an invalid user ID.
        </p>
        <Link to={ROUTES.DEVELOPERS}>
          <Button variant="primary" size="sm">
            Discover Developers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen bg-gray-50">
      {/* Header */}
      <ChatHeader
        userId={numericUserId}
        recipientName={state.recipientName}
        recipientAvatar={state.recipientAvatar}
        wsStatus={wsStatus}
      />

      {/* Messages Scroll Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader label="Loading conversation..." />
          </div>
        ) : historyError ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Unable to load chat
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              {historyError.includes('accepted connections')
                ? 'You can only message developers who are in your accepted connections. Send them a connection request first.'
                : historyError}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => void retryHistory()}>
                Retry
              </Button>
              <Link to={ROUTES.DEVELOPERS}>
                <Button variant="primary" size="sm">
                  Discover Developers
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Load Older Messages Button */}
            {hasMore && messages.length > 0 && (
              <div className="flex justify-center my-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void handleLoadOlder()}
                  isLoading={isLoadingOlder}
                  leftIcon={<ArrowUp size={14} />}
                >
                  Load older messages
                </Button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <EmptyState
                  icon={<MessageSquare size={32} />}
                  title="No messages yet"
                  description="Start the conversation! Say hello and discuss your projects."
                />
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrent =
                  Boolean(currentUser?.email) &&
                  message.senderId !== numericUserId;
                const prev = index > 0 ? messages[index - 1] : undefined;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    previousMessage={prev}
                    isCurrentUser={isCurrent}
                  />
                );
              })
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        isSending={isSending}
        disabled={isLoadingHistory || Boolean(historyError)}
      />
    </div>
  );
}
