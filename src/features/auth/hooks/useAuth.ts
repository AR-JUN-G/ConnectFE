import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContextType';

/**
 * Access authentication state and actions.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}

export const useAuthContext = useAuth;
