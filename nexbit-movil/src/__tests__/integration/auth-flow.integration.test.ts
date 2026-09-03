/**
 * Prueba de Integración: Flujo de Autenticación
 *
 * Verifica la interacción completa entre los servicios de autenticación:
 * register → login → refreshAuth (perfil) → updateMyProfile → logout
 */

import * as authService from '@/features/auth/services/auth.service';
import * as profileService from '@/features/auth/services/profile.service';
import { setAuthToken } from '@/shared/api/client';

jest.mock('@/shared/api/client');

const mockedClient = jest.mocked(require('@/shared/api/client'));

let usersDB: Record<string, unknown>[] = [];
let tokensDB: string[] = [];

function resetDB() {
  usersDB = [];
  tokensDB = [];
}

function mockPost(url: string, body: unknown) {
  if (url === '/users') {
    const user = {
      id_usuario: usersDB.length + 1,
      id_rol: 2,
      nombre_apellido: (body as Record<string, string>).nombre_apellido,
      tipo_documento: 'CC',
      numero_documento: `10000${usersDB.length}`,
      email: (body as Record<string, string>).email,
      password: (body as Record<string, string>).password,
      telefono: '3001234567',
      direccion: 'Calle 10',
      activo: 1,
    };
    usersDB.push(user);
    return Promise.resolve(user);
  }

  if (url === '/auth/login') {
    const { email, password } = body as { email: string; password: string };
    const user = usersDB.find(
      (u) => u.email === email && u.password === password && u.activo === 1,
    );
    if (!user) {
      return Promise.reject({ status: 401, message: 'Credenciales inválidas' });
    }
    const token = `jwt-token-${Date.now()}`;
    tokensDB.push(token);
    const { password: _, ...userWithoutPassword } = user;
    return Promise.resolve({ token, usuario: userWithoutPassword });
  }

  if (url === '/auth/logout') {
    return Promise.resolve({ mensaje: 'Sesión cerrada' });
  }

  if (url === '/auth/forgot-password') {
    const { email } = body as { email: string };
    const exists = usersDB.some((u) => u.email === email);
    if (!exists) {
      return Promise.reject({ status: 404, message: 'Email no encontrado' });
    }
    return Promise.resolve({ mensaje: 'Correo enviado' });
  }

  if (url === '/auth/reset-password') {
    return Promise.resolve({ mensaje: 'Contraseña actualizada' });
  }

  return Promise.reject({ status: 404 });
}

function mockGet(url: string) {
  if (url === '/users/perfil') {
    return Promise.resolve({
      id_usuario: 1,
      id_rol: 2,
      nombre_apellido: 'Juan Test',
      email: 'juan@test.com',
      telefono: '3001234567',
      direccion: 'Calle 10',
    });
  }
  return Promise.reject({ status: 404 });
}

function mockPut(url: string, body: unknown) {
  if (url === '/users/perfil') {
    return Promise.resolve({
      id_usuario: 1,
      id_rol: 2,
      ...(body as Record<string, unknown>),
    });
  }
  return Promise.reject({ status: 404 });
}

beforeEach(() => {
  resetDB();
  jest.clearAllMocks();

  mockedClient.api = {
    get: jest.fn(mockGet),
    post: jest.fn(mockPost),
    put: jest.fn(mockPut),
    patch: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(undefined),
    upload: jest.fn().mockResolvedValue({ imagen_url: 'https://cdn.example.com/img.jpg' }),
  };
  mockedClient.setAuthToken = jest.fn();
  mockedClient.getAuthToken = jest.fn(() => null);
});

describe('Integración — Flujo de Autenticación', () => {
  it('flujo completo: register → login → perfil → actualizar → logout', async () => {
    // 1. Registro — register retorna User con campo 'name' (no 'nombre_apellido')
    const registeredUser = await authService.register({
      nombre_apellido: 'Juan Test',
      email: 'juan@test.com',
      password: 'Abcd1234',
      tipo_documento: 'CC',
      numero_documento: '12345',
      telefono: '3001234567',
      direccion: 'Calle 10',
    });
    expect(registeredUser.email).toBe('juan@test.com');
    expect(registeredUser.name).toBe('Juan Test');

    // 2. Login
    const loginUser = await authService.login({
      email: 'juan@test.com',
      password: 'Abcd1234',
    });
    expect(loginUser.email).toBe('juan@test.com');
    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(expect.stringContaining('jwt-token'));

    // 3. Obtener perfil
    const profile = await profileService.getMyProfile();
    expect(profile.email).toBe('juan@test.com');
    expect(profile.name).toBe('Juan Test');

    // 4. Actualizar perfil
    const updated = await profileService.updateMyProfile({
      nombre_apellido: 'Juan Carlos Test',
      telefono: '3009876543',
      direccion: 'Carrera 20',
    });
    expect(updated.name).toBe('Juan Carlos Test');

    // 5. Logout
    await authService.logout();
    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(null);
  });

  it('register + login falla con credenciales incorrectas', async () => {
    await authService.register({
      nombre_apellido: 'Ana',
      email: 'ana@test.com',
      password: 'Abcd1234',
      tipo_documento: 'CC',
      numero_documento: '12346',
      telefono: '3001234568',
      direccion: 'Calle 20',
    });

    await expect(
      authService.login({ email: 'ana@test.com', password: 'Incorrecta' }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('forgotPassword + resetPassword fluye correctamente', async () => {
    await authService.register({
      nombre_apellido: 'Test',
      email: 'test@test.com',
      password: 'Abcd1234',
      tipo_documento: 'CC',
      numero_documento: '12347',
      telefono: '3001234569',
      direccion: 'Calle 30',
    });

    const forgotResult = await authService.requestPasswordReset('test@test.com');
    expect(forgotResult.mensaje).toBe('Correo enviado');

    const resetResult = await authService.resetPassword('token-abc', 'Nueva123');
    expect(resetResult.mensaje).toBe('Contraseña actualizada');
  });

  it('forgotPassword falla con email no registrado', async () => {
    await expect(
      authService.requestPasswordReset('noexiste@test.com'),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('logout siempre limpia el token aunque el request falle', async () => {
    mockedClient.api.post = jest.fn().mockRejectedValue(new Error('Network error'));

    try {
      await authService.logout();
    } catch {
      // esperado
    }

    expect(mockedClient.setAuthToken).toHaveBeenCalledWith(null);
  });
});
