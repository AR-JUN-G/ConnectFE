import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface HeaderProps {
  title?: string;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export function Header({ title, isMobileMenuOpen, onToggleMobileMenu }: HeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-100 bg-white lg:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {title ? (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        ) : (
          <Logo size="sm" />
        )}
      </div>
      <Logo size="sm" showText={false} />
    </header>
  );
}
