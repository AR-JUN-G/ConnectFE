import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const iconSizes = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 36,
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? 'Profile picture'}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizes[size],
          className,
        )}
        onError={(e) => {
          // Fall back to placeholder on broken image
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) parent.dataset.fallback = 'true';
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600',
        sizes[size],
        className,
      )}
      aria-label={alt ?? 'Default avatar'}
    >
      <User size={iconSizes[size]} />
    </div>
  );
}
