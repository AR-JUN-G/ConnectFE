import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export function Logo({
  className,
  size = 'md',
  showText = true,
  textColor,
}: LogoProps) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textMap = {
    sm: 'text-base font-bold',
    md: 'text-lg font-bold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl font-bold',
  };

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'rounded-xl overflow-hidden bg-[#11161B] border border-gray-800 shadow-sm flex items-center justify-center p-1 flex-shrink-0 transition-transform hover:scale-105',
          sizeMap[size],
        )}
      >
        <img
          src="/logo.png"
          alt="Connect Logo"
          className="w-full h-full object-contain filter brightness-110"
        />
      </div>
      {showText && (
        <span
          className={cn(
            'tracking-tight font-extrabold',
            textMap[size],
            textColor ?? 'text-gray-900',
          )}
        >
          Connect
        </span>
      )}
    </div>
  );
}
