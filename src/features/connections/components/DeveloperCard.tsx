import { Link } from 'react-router-dom';
import { UserPlus, Check, MessageSquare } from 'lucide-react';
import type { UserCardResponse } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/constants/routes';

interface DeveloperCardProps {
  developer: UserCardResponse;
  onConnect: (id: number) => void;
  isSending: boolean;
  hasSent: boolean;
}

export function DeveloperCard({
  developer,
  onConnect,
  isSending,
  hasSent,
}: DeveloperCardProps) {
  const fullName = `${developer.firstName} ${developer.lastName}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
      <Avatar
        src={developer.profileImageUrl}
        alt={fullName}
        size="lg"
        className="mb-3 w-16 h-16"
      />

      <h3 className="font-semibold text-gray-900 text-base mb-1 truncate max-w-full">
        {fullName}
      </h3>
      <p className="text-xs text-gray-500 mb-4">Developer</p>

      <div className="flex items-center gap-2 w-full mt-auto">
        {hasSent ? (
          <Button
            variant="secondary"
            size="sm"
            disabled
            className="flex-1 text-emerald-700 bg-emerald-50 border-emerald-200"
            leftIcon={<Check size={14} className="text-emerald-600" />}
          >
            Pending
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            isLoading={isSending}
            onClick={() => onConnect(developer.id)}
            leftIcon={<UserPlus size={14} />}
          >
            Connect
          </Button>
        )}

        <Link
          to={ROUTES.chatWith(developer.id)}
          state={{ recipientName: fullName, recipientAvatar: developer.profileImageUrl }}
          className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors"
          title={`Message ${developer.firstName}`}
          aria-label={`Message ${developer.firstName}`}
        >
          <MessageSquare size={16} />
        </Link>
      </div>
    </div>
  );
}
