import { api, setAuthToken } from '@/shared/api/client';

import type {
  BackendUsuario,
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types';
import { mapUsuarioToUser } from '@/features/auth/types/auth.types';

export async function login(credentials: LoginCredentials): Promise<User> {
  const data = await api.post<LoginResponse>('/auth/login', credentials);
  setAuthToken(data.token);
  return mapUsuarioToUser(data.usuario);
}

export async function register(payload: RegisterPayload): Promise<User> {
  const usuario = await api.post<BackendUsuario>('/users', payload);
  return mapUsuarioToUser(usuario);
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

export async function refreshAuth(): Promise<User> {
  const usuario = await api.get<BackendUsuario>('/users/perfil');
  return mapUsuarioToUser(usuario);
}