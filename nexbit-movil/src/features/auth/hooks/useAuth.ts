import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import * as authService from '@/features/auth/services/auth.service';
import type { RegisterPayload, Role, User } from '@/features/auth/types/auth.types';

type AuthContextValue = {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password });
    setUser(session.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await authService.register(payload);
    setUser(session.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.logout();
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