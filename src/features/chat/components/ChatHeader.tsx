import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';
import { ROUTES } from '@/constants/routes';

interface ChatHeaderProps {
  userId: number;
  recipientName?: string;
  recipientAvatar?: string;
  wsStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
}

export function ChatHeader({
  userId,
  recipientName,
  recipientAvatar,
  wsStatus,
}: ChatHeaderProps) {
  const isWsConnected = wsStatus === 'connected';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.MESSAGES}
          className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back to messages"
        >
          <ArrowLeft size={18} />
        </Link>

        <Avatar
          src={recipientAvatar}
          alt={recipientName ?? `Developer #${userId}`}
          size="sm"
        />

        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {recipientName || `Developer #${userId}`}
          </h2>
          <p className="text-[11px] text-gray-500">
            {recipientName ? `User ID: ${userId}` : 'Connected Developer'}
          </p>
        </div>
      </div>

      {/* Connection Indicator */}
      <div
        className="flex items-center gap-1.5 text-xs text-gray-500"
        title={`Live updates: ${wsStatus}`}
      >
        {isWsConnected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 hidden sm:inline">
              Live
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-gray-400 hidden sm:inline">
              {wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
