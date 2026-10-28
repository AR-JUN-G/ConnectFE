import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquarePlus, Search, MessageSquare, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';
import {
  getStoredConversations,
  removeConversation,
  type ConversationSummary,
} from '../utils/conversationStorage';
import { NewChatModal } from './NewChatModal';
import { cn } from '@/utils/cn';

interface ConversationListProps {
  activeUserId?: number;
  className?: string;
  onSelectConversation?: () => void;
}

export function ConversationList({
  activeUserId,
  className,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadConversations = () => {
    setConversations(getStoredConversations());
  };

  useEffect(() => {
    loadConversations();
    // Listen to local storage changes from other components / tabs
    const handleStorage = () => loadConversations();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [activeUserId]);

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeConversation(id);
    loadConversations();
  };

  const filtered = conversations.filter((c) => {
    const query = search.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.userId.toString().includes(query) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(query))
    );
  });

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-200 overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Messages</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<MessageSquarePlus size={16} />}
          title="Start new conversation"
        >
          New Chat
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="p-6 text-center flex flex-col items-center justify-center h-48">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
              <MessageSquare size={20} />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-1">
              {search ? 'No matching conversations' : 'No conversations yet'}
            </p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mb-3">
              {search
                ? 'Try searching by name or developer user ID'
                : 'Connect with developers or start a new chat directly.'}
            </p>
            {!search && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<MessageSquarePlus size={14} />}
              >
                Start a Chat
              </Button>
            )}
          </div>
        ) : (
          filtered.map((c) => {
            const isActive = activeUserId === c.userId;

            return (
              <NavLink
                key={c.userId}
                to={ROUTES.chatWith(c.userId)}
                state={{ recipientName: c.name, recipientAvatar: c.avatar }}
                onClick={onSelectConversation}
                className={({ isActive: navActive }) =>
                  cn(
                    'group flex items-center gap-3 px-4 py-3 text-left transition-colors relative hover:bg-gray-50',
                    (isActive || navActive) && 'bg-primary-50/70 hover:bg-primary-50',
                  )
                }
              >
                <Avatar
                  src={c.avatar}
                  alt={c.name}
                  size="md"
                  className="flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {c.name}
                    </h3>
                    {c.lastMessageTime && (
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {c.lastMessageTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {c.lastMessage || `User ID: ${c.userId}`}
                  </p>
                </div>

                {/* Delete conversation action on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, c.userId)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity rounded"
                  title="Remove from history"
                  aria-label="Remove conversation"
                >
                  <Trash2 size={14} />
                </button>
              </NavLink>
            );
          })
        )}
      </div>

      <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
