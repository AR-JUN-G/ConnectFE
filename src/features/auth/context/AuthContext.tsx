import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getProfile } from '@/services/userService';
import { logout as apiLogout } from '@/services/authService';
import { stompClientManager } from '@/websocket/stompClient';
import type { UserProfile } from '@/types';
import { AuthContext } from './AuthContextType';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setCurrentUser(profile);
      // Connect WebSocket once authenticated
      stompClientManager.connect();
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // On mount: validate session by calling the profile endpoint.
  // A 200 means the HttpOnly cookie is present and valid.
  // A 401 means the user is not authenticated.
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const profile = await getProfile();
        if (!cancelled) {
          setCurrentUser(profile);
          stompClientManager.connect();
        }
      } catch {
        if (!cancelled) setCurrentUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void init();
    return () => { cancelled = true; };
  }, []);

  // Listen for 401 events dispatched by the Axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      stompClientManager.disconnect();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Proceed with state cleanup regardless of network error
    } finally {
      setCurrentUser(null);
      stompClientManager.disconnect();
    }
  }, []);

  // Disconnect WebSocket on unmount
  useEffect(() => {
    return () => {
      stompClientManager.disconnect();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated: currentUser !== null,
        refreshProfile,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
