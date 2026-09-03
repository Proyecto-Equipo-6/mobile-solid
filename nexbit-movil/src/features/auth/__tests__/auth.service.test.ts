import { setAuthToken } from '@/shared/api/client';
import { login, register, logout, refreshAuth, requestPasswordReset, resetPassword } from '@/features/auth/services/auth.service';
import { getMyProfile, updateMyProfile } from '@/features/auth/services/profile.service';

global.fetch = jest.fn();

function mockFetch(body: unknown, options: { ok?: boolean; status?: number } = {}) {
  const bodyString = JSON.stringify(body);
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => body,
    text: async () => bodyString,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  setAuthToken(null);
});

describe('auth.service - integración', () => {
  describe('login', () => {
    it('llama POST /auth/login y retorna User mapeado', async () => {
      mockFetch({
        token: 'jwt-abc-123',
        usuario: {
          id_usuario: 1,
          id_rol: 2,
          nombre_apellido: 'Juan Pérez',
          email: 'juan@test.com',
          telefono: '3001234567',
        },
      });

      const user = await login({ email: 'juan@test.com', password: '1234' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(user).toEqual({
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '3001234567',
        role: 'client',
      });
    });

    it('guarda el token en memoria después del login', async () => {
      mockFetch({
        token: 'jwt-xyz-789',
        usuario: { id_usuario: 2, id_rol: 1, nombre_apellido: 'Admin', email: 'admin@test.com' },
      });

      await login({ email: 'admin@test.com', password: 'admin' });

      const { getAuthToken } = require('@/shared/api/client');
      expect(getAuthToken()).toBe('jwt-xyz-789');
    });

    it('lanza error cuando las credenciales son inválidas', async () => {
      mockFetch({ error: 'Credenciales inválidas' }, { ok: false, status: 401 });

      await expect(
        login({ email: 'wrong@test.com', password: 'bad' }),
      ).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('llama POST /users y retorna User mapeado', async () => {
      mockFetch({
        id_usuario: 10,
        id_rol: 2,
        nombre_apellido: 'Ana García',
        email: 'ana@test.com',
      });

      const user = await register({
        nombre_apellido: 'Ana García',
        tipo_documento: 'CC',
        numero_documento: '1234567890',
        email: 'ana@test.com',
        password: '1234',
        telefono: '3009876543',
        direccion: 'Calle 10 #5-20',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(user.name).toBe('Ana García');
      expect(user.role).toBe('client');
    });
  });

  describe('refreshAuth', () => {
    it('llama GET /users/perfil y retorna User', async () => {
      mockFetch({
        id_usuario: 1,
        id_rol: 3,
        nombre_apellido: 'Carlos Conductor',
        email: 'carlos@test.com',
      });

      const user = await refreshAuth();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/perfil'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(user.role).toBe('driver');
    });
  });

  describe('logout', () => {
    it('llama POST /auth/logout y limpia el token', async () => {
      mockFetch({ mensaje: 'Sesión cerrada' });
      setAuthToken('jwt-abc-123');

      await logout();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({ method: 'POST' }),
      );
      const { getAuthToken } = require('@/shared/api/client');
      expect(getAuthToken()).toBeNull();
    });

    it('limpia el token aunque el request falle', async () => {
      mockFetch({ error: 'Error' }, { ok: false, status: 500 });
      setAuthToken('jwt-abc-123');

      try {
        await logout();
      } catch {
        // logout rethrows after clearing token
      }

      const { getAuthToken } = require('@/shared/api/client');
      expect(getAuthToken()).toBeNull();
    });
  });

  describe('getMyProfile', () => {
    it('lanza error cuando el servidor falla', async () => {
      mockFetch({ error: 'Token inválido' }, { ok: false, status: 401 });

      await expect(getMyProfile()).rejects.toThrow();
    });
  });

  describe('updateMyProfile', () => {
    it('llama PUT /users/perfil con los datos actualizados', async () => {
      mockFetch({
        id_usuario: 1,
        id_rol: 2,
        nombre_apellido: 'Juan Actualizado',
        email: 'juan@test.com',
        telefono: '3009999999',
      });

      const user = await updateMyProfile({ nombre_apellido: 'Juan Actualizado', telefono: '3009999999' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/perfil'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(user.name).toBe('Juan Actualizado');
      expect(user.phone).toBe('3009999999');
    });

    it('lanza error cuando los datos son inválidos', async () => {
      mockFetch({ error: 'Datos inválidos' }, { ok: false, status: 400 });

      await expect(updateMyProfile({ telefono: '' })).rejects.toThrow();
    });
  });

  describe('requestPasswordReset', () => {
    it('llama POST /auth/forgot-password con el email', async () => {
      mockFetch({ mensaje: 'Correo de recuperación enviado' });

      const result = await requestPasswordReset('juan@test.com');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.mensaje).toBe('Correo de recuperación enviado');
    });

    it('lanza error cuando el email no existe', async () => {
      mockFetch({ error: 'Email no registrado' }, { ok: false, status: 404 });

      await expect(requestPasswordReset('noexiste@test.com')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('llama POST /auth/reset-password con token y nueva contraseña', async () => {
      mockFetch({ mensaje: 'Contraseña actualizada correctamente' });

      const result = await resetPassword('token-abc-123', 'nuevaPass123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.mensaje).toBe('Contraseña actualizada correctamente');
    });

    it('lanza error cuando el token es inválido', async () => {
      mockFetch({ error: 'Token inválido o expirado' }, { ok: false, status: 400 });

      await expect(resetPassword('token-invalido', 'nuevaPass')).rejects.toThrow();
    });

    it('lanza error cuando el token ha expirado', async () => {
      mockFetch({ error: 'Token expirado' }, { ok: false, status: 410 });

      await expect(resetPassword('token-expirado', 'nuevaPass')).rejects.toThrow();
    });
  });
});
