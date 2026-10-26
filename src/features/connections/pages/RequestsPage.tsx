import { UserCheck } from 'lucide-react';
import { useReceivedRequests } from '../hooks/useReceivedRequests';
import { RequestCard } from '../components/RequestCard';
import { Skeleton } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export function RequestsPage() {
  const {
    requests,
    isLoading,
    isError,
    error,
    refetch,
    reviewRequest,
    isProcessing,
  } = useReceivedRequests();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Connection Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review developers who want to connect with you.
          </p>
        </div>
        {!isLoading && requests.length > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
            {requests.length} pending
          </span>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="w-16 h-8 rounded-lg" />
                <Skeleton className="w-16 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load received connection requests.'
          }
          onRetry={() => void refetch()}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={32} />}
          title="No pending requests"
          description="When other developers send you connection requests, they will appear here."
        />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={(id) => reviewRequest(id, 'ACCEPT')}
              onReject={(id) => reviewRequest(id, 'REJECT')}
              isProcessing={isProcessing(request.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
