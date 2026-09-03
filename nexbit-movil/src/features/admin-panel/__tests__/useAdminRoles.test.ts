import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminRoles } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminRoles hook', () => {
  it('carga roles al montar', async () => {
    mockedAdminService.listRoles.mockResolvedValue([
      { id: '1', name: 'Admin', description: 'Administrador' },
    ]);

    const { result } = await renderHook(() => useAdminRoles());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roles).toHaveLength(1);
  });

  it('maneja error al cargar roles', async () => {
    mockedAdminService.listRoles.mockRejectedValue(new Error('Server error'));

    const { result } = await renderHook(() => useAdminRoles());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('create agrega un rol a la lista', async () => {
    mockedAdminService.listRoles.mockResolvedValue([]);
    mockedAdminService.createRole.mockResolvedValue({
      id: '2', name: 'Invitado', description: 'Guest role',
    });

    const { result } = await renderHook(() => useAdminRoles());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ name: 'Invitado', description: 'Guest role' });
    });

    expect(result.current.roles).toHaveLength(1);
    expect(result.current.roles[0].name).toBe('Invitado');
  });

  it('update actualiza un rol en la lista', async () => {
    mockedAdminService.listRoles.mockResolvedValue([
      { id: '1', name: 'Admin', description: 'Administrador' },
    ]);
    mockedAdminService.updateRole.mockResolvedValue({
      id: '1', name: 'Super Admin', description: 'Full access',
    });

    const { result } = await renderHook(() => useAdminRoles());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', { name: 'Super Admin', description: 'Full access' });
    });

    expect(result.current.roles[0].name).toBe('Super Admin');
  });
});
