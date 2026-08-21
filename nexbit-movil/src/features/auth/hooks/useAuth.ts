import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import * as authService from '@/features/auth/services/auth.service';
import { initializeAuthToken, getAuthToken } from '@/shared/api/client';
import type { RegisterPayload, Role, User } from '@/features/auth/types/auth.types';

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.refreshAuth();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initializeAuthToken();
      } catch {
        // Silenciar error de inicialización de token
      }
      if (mounted && getAuthToken()) {
        await refreshUser();
      } else if (mounted) {
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login({ email, password });
      setUser(user);
    } catch (error) {
      // El error se propaga a la UI para mostrar mensaje
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      await authService.register(payload);
    } catch (error) {
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Silenciar error de logout
    } finally {
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    role: user?.role ?? null,
    isAuthenticated: user !== null,
    isLoading,
    signIn,
    register,
    signOut,
    refreshUser,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}