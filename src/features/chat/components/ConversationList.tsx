import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquarePlus,
  Search,
  MessageSquare,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { ROUTES } from '@/constants/routes';
import {
  getStoredConversations,
  removeConversation,
  type ConversationSummary,
} from '../utils/conversationStorage';
import { useConversations } from '../hooks/useConversations';
import { NewChatModal } from './NewChatModal';
import { cn } from '@/utils/cn';
import { formatRelativeDate } from '@/utils/formatDate';

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
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API conversations (authoritative source with real names from backend)
  const {
    conversations: apiConversations,
    isLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
    refresh,
  } = useConversations();

  // Local storage conversations (fallback for ones started via NewChatModal before any API data)
  const [localConversations, setLocalConversations] = useState<ConversationSummary[]>([]);

  const loadLocalConversations = () => {
    setLocalConversations(getStoredConversations());
  };

  useEffect(() => {
    loadLocalConversations();
    const handleStorage = () => loadLocalConversations();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [activeUserId, apiConversations]);

  // Merge: API conversations take precedence; fall back to localStorage for any
  // user IDs not yet returned by the API (e.g., newly opened chats before a message is sent).
  const apiIds = new Set(apiConversations.map((c) => c.receiverID));
  const localOnly = localConversations.filter((c) => !apiIds.has(c.userId));

  // Unified list for rendering: API items first (real names, sorted by recency),
  // then any localStorage-only entries the API doesn't know about yet.
  const unified: ConversationSummary[] = [
    ...apiConversations.map((c) => ({
      userId: c.receiverID,
      name: c.receiverName,
      avatar: c.receiverAvatarUrl ?? undefined,
      lastMessage: c.lastMessage,
      lastMessageTime: formatRelativeDate(c.lastMessageTime),
    })),
    ...localOnly,
  ];

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeConversation(id);
    loadLocalConversations();
  };

  const filtered = unified.filter((c) => {
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
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          Messages
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refresh}
            disabled={isFetching}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh conversations"
            aria-label="Refresh conversations"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
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
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-900 placeholder-gray-400 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {isLoading ? (
          /* Skeleton loading state */
          <div className="p-3 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-2">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="w-32 h-3.5 rounded" />
                  <Skeleton className="w-48 h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error state — fall back to localStorage */
          <>
            {localConversations.length > 0 ? (
              localConversations
                .filter((c) => {
                  const q = search.toLowerCase().trim();
                  return (
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.userId.toString().includes(q)
                  );
                })
                .map((c) => (
                  <ConversationItem
                    key={c.userId}
                    conv={c}
                    isActive={activeUserId === c.userId}
                    onDelete={handleDelete}
                    onSelectConversation={onSelectConversation}
                  />
                ))
            ) : (
              <div className="p-6 text-center flex flex-col items-center justify-center h-48">
                <p className="text-xs text-red-600 mb-2">
                  Failed to load conversations.
                </p>
                <Button variant="secondary" size="sm" onClick={refresh}>
                  Retry
                </Button>
              </div>
            )}
          </>
        ) : filtered.length === 0 ? (
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
          <>
            {filtered.map((c) => (
              <ConversationItem
                key={c.userId}
                conv={c}
                isActive={activeUserId === c.userId}
                onDelete={handleDelete}
                onSelectConversation={onSelectConversation}
              />
            ))}

            {/* Load more button for pagination */}
            {hasMore && !search && (
              <div className="p-3 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={loadMore}
                  isLoading={isFetching}
                >
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

interface ConversationItemProps {
  conv: ConversationSummary;
  isActive: boolean;
  onDelete: (e: React.MouseEvent, id: number) => void;
  onSelectConversation?: () => void;
}

function ConversationItem({
  conv,
  isActive,
  onDelete,
  onSelectConversation,
}: ConversationItemProps) {
  return (
    <NavLink
      to={ROUTES.chatWith(conv.userId)}
      state={{ recipientName: conv.name, recipientAvatar: conv.avatar }}
      onClick={onSelectConversation}
      className={({ isActive: navActive }) =>
        cn(
          'group flex items-center gap-3 px-4 py-3 text-left transition-colors relative hover:bg-gray-50',
          (isActive || navActive) &&
            'bg-primary-50/70 hover:bg-primary-50',
        )
      }
    >
      <Avatar
        src={conv.avatar}
        alt={conv.name}
        size="md"
        className="flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {conv.name}
          </h3>
          {conv.lastMessageTime && (
            <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
              {conv.lastMessageTime}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {conv.lastMessage || `User ID: ${conv.userId}`}
        </p>
      </div>

      {/* Delete on hover */}
      <button
        type="button"
        onClick={(e) => onDelete(e, conv.userId)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity rounded"
        title="Remove from history"
        aria-label="Remove conversation"
      >
        <Trash2 size={14} />
      </button>
    </NavLink>
  );
}
