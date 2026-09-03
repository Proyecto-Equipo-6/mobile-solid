import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminDrivers } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminDrivers hook', () => {
  it('carga repartidores al montar', async () => {
    mockedAdminService.listDriversAdmin.mockResolvedValue([
      { id: '1', name: 'Carlos', email: 'c@test.com', phone: '300', status: 'DISPONIBLE', deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0 },
    ]);

    const { result } = await renderHook(() => useAdminDrivers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.drivers).toHaveLength(1);
  });

  it('maneja error al cargar repartidores', async () => {
    mockedAdminService.listDriversAdmin.mockRejectedValue(new Error('Server error'));

    const { result } = await renderHook(() => useAdminDrivers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('create llama createDriver y recarga', async () => {
    mockedAdminService.listDriversAdmin
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: '2', name: 'Nuevo', email: 'n@test.com', phone: '300', status: 'DISPONIBLE', deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0 },
      ]);
    mockedAdminService.createDriver.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminDrivers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ nombre_apellido: 'Nuevo', email: 'n@test.com', password: '1234', telefono: '300' });
    });

    expect(mockedAdminService.createDriver).toHaveBeenCalled();
  });

  it('update llama updateDriver y recarga', async () => {
    mockedAdminService.listDriversAdmin
      .mockResolvedValueOnce([{ id: '1', name: 'Carlos', email: 'c@test.com', phone: '300', status: 'DISPONIBLE', deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0 }])
      .mockResolvedValueOnce([{ id: '1', name: 'Carlos Upd', email: 'c@test.com', phone: '300', status: 'DISPONIBLE', deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0 }]);
    mockedAdminService.updateDriver.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminDrivers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', { nombre_apellido: 'Carlos Upd' });
    });

    expect(mockedAdminService.updateDriver).toHaveBeenCalledWith('1', { nombre_apellido: 'Carlos Upd' });
  });

  it('remove elimina un repartidor de la lista', async () => {
    mockedAdminService.listDriversAdmin.mockResolvedValue([
      { id: '1', name: 'Carlos', email: 'c@test.com', phone: '300', status: 'DISPONIBLE', deliveriesToday: 0, deliveriesWeek: 0, deliveriesMonth: 0 },
    ]);
    mockedAdminService.deleteDriver.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminDrivers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(result.current.drivers).toHaveLength(0);
  });
});
