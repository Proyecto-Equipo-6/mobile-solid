export type Role = 'client' | 'admin' | 'driver';

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
};

export type AuthSession = {
  user: User;
  token: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export const ROLE_HOME: Record<Role, string> = {
  client: '/home',
  admin: '/products',
  driver: '/deliveries',
};