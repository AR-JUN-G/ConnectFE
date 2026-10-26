import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LoaderProps {
  className?: string;
  size?: number;
  label?: string;
  fullScreen?: boolean;
}

export function Loader({ className, size = 24, label = 'Loading...', fullScreen = false }: LoaderProps) {
  const content = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Loader2 className="animate-spin text-primary-600" size={size} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {content}
      </div>
    );
  }

  return content;
}

/** Skeleton rectangle for loading states */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      aria-hidden="true"
    />
  );
}
