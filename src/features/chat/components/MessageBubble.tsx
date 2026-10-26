import { memo } from 'react';
import type { ChatMessage } from '@/types';
import { formatMessageTime, formatRelativeDate, isDifferentDay } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  message: ChatMessage;
  previousMessage?: ChatMessage;
  isCurrentUser: boolean;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  previousMessage,
  isCurrentUser,
}: MessageBubbleProps) {
  const showDateSeparator =
    !previousMessage || isDifferentDay(previousMessage.createdAt, message.createdAt);

  return (
    <div className="flex flex-col">
      {/* Date separator */}
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
            {formatRelativeDate(message.createdAt)}
          </span>
        </div>
      )}

      {/* Message row */}
      <div
        className={cn(
          'flex flex-col mb-2 max-w-[75%]',
          isCurrentUser ? 'self-end items-end' : 'self-start items-start',
        )}
      >
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap shadow-sm',
            isCurrentUser
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-white text-gray-900 border border-gray-200 rounded-tl-none',
          )}
        >
          {message.content}
        </div>
        <span className="text-[11px] text-gray-400 mt-1 px-1">
          {formatMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
});
