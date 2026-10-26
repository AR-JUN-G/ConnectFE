import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDeveloperFeed } from '../hooks/useDeveloperFeed';
import { DeveloperCard } from '../components/DeveloperCard';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export function DevelopersPage() {
  const pageSize = 8;
  const {
    developers,
    page,
    nextPage,
    prevPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    sendRequest,
    isSending,
    hasSent,
  } = useDeveloperFeed(0, pageSize);

  const hasNextPage = developers.length === pageSize;
  const hasPrevPage = page > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Discover Developers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Expand your network by connecting with software engineers and creators.
        </p>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center"
            >
              <Skeleton className="w-16 h-16 rounded-full mb-3" />
              <Skeleton className="w-28 h-4 mb-2" />
              <Skeleton className="w-16 h-3 mb-4" />
              <Skeleton className="w-full h-8 rounded-lg" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load developer suggestions.'
          }
          onRetry={() => void refetch()}
        />
      ) : developers.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No developers to display"
          description={
            page > 0
              ? 'You have reached the end of the suggestion feed.'
              : 'There are currently no new developer suggestions available.'
          }
          action={
            page > 0 ? (
              <Button variant="secondary" size="sm" onClick={prevPage}>
                Back to previous page
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {developers.map((developer) => (
              <DeveloperCard
                key={developer.id}
                developer={developer}
                onConnect={sendRequest}
                isSending={isSending(developer.id)}
                hasSent={hasSent(developer.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Page {page + 1}
              {isFetching && !isLoading && (
                <span className="ml-2 text-xs text-primary-600 animate-pulse">
                  Updating...
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevPage}
                disabled={!hasPrevPage || isFetching}
                leftIcon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextPage}
                disabled={!hasNextPage || isFetching}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
