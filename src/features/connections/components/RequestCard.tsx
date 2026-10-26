import { Check, X } from 'lucide-react';
import type { UserCardResponse } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';

interface RequestCardProps {
  request: UserCardResponse;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing: boolean;
}

export function RequestCard({
  request,
  onAccept,
  onReject,
  isProcessing,
}: RequestCardProps) {
  const fullName = `${request.firstName} ${request.lastName}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          src={request.profileImageUrl}
          alt={fullName}
          size="md"
        />
        <div className="min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">
            {fullName}
          </h4>
          <p className="text-xs text-gray-500">Wants to connect with you</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          variant="secondary"
          size="sm"
          disabled={isProcessing}
          onClick={() => onReject(request.id)}
          leftIcon={<X size={14} />}
        >
          Decline
        </Button>
        <Button
          variant="primary"
          size="sm"
          isLoading={isProcessing}
          onClick={() => onAccept(request.id)}
          leftIcon={<Check size={14} />}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}
