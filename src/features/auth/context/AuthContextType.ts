import { createContext } from 'react';
import type { UserProfile } from '@/types';

export interface AuthContextValue {
  currentUser: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Call after a successful login/register to fetch the profile. */
  refreshProfile: () => Promise<void>;
  /** Set auth state directly (e.g., after login with a profile response). */
  setCurrentUser: (user: UserProfile | null) => void;
  /** Log out: invalidate server session cookie, clear state, disconnect WebSocket. */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
