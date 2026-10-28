import { NavLink } from 'react-router-dom';
import { Users, UserCheck, MessageSquare, User } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const navItems = [
  { to: ROUTES.DEVELOPERS, label: 'Discover', icon: <Users size={20} /> },
  { to: ROUTES.REQUESTS, label: 'Requests', icon: <UserCheck size={20} /> },
  { to: ROUTES.MESSAGES, label: 'Messages', icon: <MessageSquare size={20} /> },
  { to: ROUTES.PROFILE, label: 'Profile', icon: <User size={20} /> },
];

export function MobileNavigation() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <ul className="flex">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-800',
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
  );
}
