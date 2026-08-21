import { api } from '@/shared/api/client';

import type { BackendUsuario, RegisterPayload, User } from '@/features/auth/types/auth.types';
import { mapUsuarioToUser } from '@/features/auth/types/auth.types';

export async function getMyProfile(): Promise<User> {
  const usuario = await api.get<BackendUsuario>('/users/perfil');
  return mapUsuarioToUser(usuario);
}

export async function updateMyProfile(
  payload: Partial<Pick<RegisterPayload, 'telefono' | 'direccion' | 'nombre_apellido'>>,
): Promise<User> {
  const usuario = await api.put<BackendUsuario>('/users/perfil', payload);
  return mapUsuarioToUser(usuario);
}