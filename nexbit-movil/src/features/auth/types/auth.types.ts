export type Role = 'client' | 'admin' | 'driver';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type TipoDocumento = 'CC' | 'Pasaporte' | 'CE' | 'Otro';

export type RegisterPayload = {
  nombre_apellido: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
};

export type BackendUsuario = {
  id?: number | string;
  id_usuario?: number | string;
  id_rol: number | string;
  nombre_apellido: string;
  email: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  direccion?: string;
  activo?: number;
};

const ROL_ID_A_ROLE: Record<number, Role> = {
  1: 'admin',
  2: 'client',
  3: 'driver',
};

export function mapUsuarioToUser(usuario: BackendUsuario): User {
  return {
    id: String(usuario.id_usuario ?? usuario.id),
    name: usuario.nombre_apellido,
    email: usuario.email,
    phone: usuario.telefono,
    role: ROL_ID_A_ROLE[Number(usuario.id_rol)] ?? 'client',
  };
}

export const ROLE_HOME: Record<Role, string> = {
  client: '/home',
  admin: '/products',
  driver: '/deliveries',
};