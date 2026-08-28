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
});

describe('profile.service - integración', () => {
  describe('getMyProfile', () => {
    it('llama GET /users/perfil y retorna User mapeado', async () => {
      mockFetch({
        id_usuario: 1,
        id_rol: 2,
        nombre_apellido: 'Juan Pérez',
        email: 'juan@test.com',
        telefono: '3001234567',
      });

      const user = await getMyProfile();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/perfil'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(user).toEqual({
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '3001234567',
        role: 'client',
      });
    });

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

      const user = await updateMyProfile({
        nombre_apellido: 'Juan Actualizado',
        telefono: '3009999999',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/perfil'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(user.name).toBe('Juan Actualizado');
      expect(user.phone).toBe('3009999999');
    });

    it('lanza error cuando los datos son inválidos', async () => {
      mockFetch({ error: 'Datos inválidos' }, { ok: false, status: 400 });

      await expect(
        updateMyProfile({ telefono: '' }),
      ).rejects.toThrow();
    });
  });
});
