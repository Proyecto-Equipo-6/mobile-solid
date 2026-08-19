import { api } from '@/shared/api/client';

import type {
  BackendUsuario,
  LoginCredentials,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types';
import { mapUsuarioToUser } from '@/features/auth/types/auth.types';

export async function login(credentials: LoginCredentials): Promise<User> {
  const data = await api.post<{ usuario: BackendUsuario }>('/auth/login', credentials);
  return mapUsuarioToUser(data.usuario);
}

export async function register(payload: RegisterPayload): Promise<User> {
  const usuario = await api.post<BackendUsuario>('/users', payload);
  return mapUsuarioToUser(usuario);
}

export async function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}