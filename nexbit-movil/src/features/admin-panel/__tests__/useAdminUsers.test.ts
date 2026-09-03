import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminUsers } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminUsers hook', () => {
  it('carga usuarios y roles al montar', async () => {
    mockedAdminService.listUsers.mockResolvedValue([
      { id: '1', name: 'Admin', email: 'admin@test.com', phone: '3001234567', roleId: '1', documentType: 'CC', documentNumber: '123', address: 'Calle', active: true },
    ]);
    mockedAdminService.listRolesForDropdown.mockResolvedValue([
      { id: '1', name: 'Admin' },
    ]);

    const { result } = await renderHook(() => useAdminUsers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.roles).toHaveLength(1);
  });

  it('maneja error al cargar usuarios', async () => {
    mockedAdminService.listUsers.mockRejectedValue(new Error('Server error'));
    mockedAdminService.listRolesForDropdown.mockResolvedValue([]);

    const { result } = await renderHook(() => useAdminUsers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('create agrega un usuario a la lista', async () => {
    mockedAdminService.listUsers.mockResolvedValue([]);
    mockedAdminService.listRolesForDropdown.mockResolvedValue([]);
    mockedAdminService.createUser.mockResolvedValue({
      id: '2', name: 'Nuevo', email: 'n@test.com', phone: '3001234567', roleId: '2', documentType: 'CC', documentNumber: '456', address: '', active: true,
    });

    const { result } = await renderHook(() => useAdminUsers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.create({
        nombre_apellido: 'Nuevo', email: 'n@test.com', password: '1234', id_rol: 2, telefono: '3001234567',
      });
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0].name).toBe('Nuevo');
  });

  it('update actualiza un usuario en la lista', async () => {
    mockedAdminService.listUsers.mockResolvedValue([
      { id: '1', name: 'Admin', email: 'admin@test.com', phone: '3001234567', roleId: '1', documentType: 'CC', documentNumber: '123', address: 'Calle', active: true },
    ]);
    mockedAdminService.listRolesForDropdown.mockResolvedValue([]);
    mockedAdminService.updateUser.mockResolvedValue({
      id: '1', name: 'Admin Actualizado', email: 'admin@test.com', phone: '3001234567', roleId: '1', documentType: 'CC', documentNumber: '123', address: 'Calle', active: true,
    });

    const { result } = await renderHook(() => useAdminUsers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', { nombre_apellido: 'Admin Actualizado' });
    });

    expect(result.current.users[0].name).toBe('Admin Actualizado');
  });

  it('remove elimina un usuario de la lista', async () => {
    mockedAdminService.listUsers.mockResolvedValue([
      { id: '1', name: 'Admin', email: 'admin@test.com', phone: '3001234567', roleId: '1', documentType: 'CC', documentNumber: '123', address: 'Calle', active: true },
    ]);
    mockedAdminService.listRolesForDropdown.mockResolvedValue([]);
    mockedAdminService.deleteUser.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminUsers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(result.current.users).toHaveLength(0);
  });
});
