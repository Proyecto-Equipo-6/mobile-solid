import { api } from '@/shared/api/client';

import type { AuthSession, LoginCredentials, RegisterPayload } from '@/features/auth/types/auth.types';

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/login', credentials);
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/register', payload);
}

export async function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}