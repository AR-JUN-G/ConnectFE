import { NavLink } from 'react-router-dom';
import { Users, UserCheck, User, Code2, LogOut } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: ROUTES.DEVELOPERS, label: 'Discover', icon: <Users size={20} /> },
  { to: ROUTES.REQUESTS, label: 'Requests', icon: <UserCheck size={20} /> },
  { to: ROUTES.PROFILE, label: 'Profile', icon: <User size={20} /> },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <aside className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <Code2 size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          DevNetwork
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        {currentUser && (
          <div className="flex items-center gap-3 px-2 mb-2">
            <Avatar
              src={currentUser.profileImageUrl}
              alt={`${currentUser.firstName} ${currentUser.lastName}`}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
