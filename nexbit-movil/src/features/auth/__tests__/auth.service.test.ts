import { setAuthToken } from '@/shared/api/client';
import { login, register, refreshAuth } from '@/features/auth/services/auth.service';

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
});
