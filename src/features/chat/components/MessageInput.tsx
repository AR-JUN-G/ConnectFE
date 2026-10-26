import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<unknown>;
  isSending: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  isSending,
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    try {
      setContent('');
      await onSendMessage(trimmed);
      // Refocus after send
      inputRef.current?.focus();
    } catch {
      // Restore input on failure so user doesn't lose text
      setContent(trimmed);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 bg-white border-t border-gray-200">
      <textarea
        ref={inputRef}
        rows={1}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? 'Cannot message this user' : 'Type a message... (Enter to send)'}
        disabled={disabled || isSending}
        className="flex-1 max-h-32 min-h-[40px] py-2 px-3 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <Button
        variant="primary"
        size="md"
        isLoading={isSending}
        disabled={disabled || !content.trim()}
        onClick={() => void handleSend()}
        className="h-10 w-10 p-0 rounded-xl flex-shrink-0"
        aria-label="Send message"
      >
        <Send size={16} />
      </Button>
    </div>
  );
}
