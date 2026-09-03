import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminSuppliers } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminSuppliers hook', () => {
  it('carga proveedores al montar', async () => {
    mockedAdminService.listAllSuppliers.mockResolvedValue([
      { id: '1', name: 'Tech SA', nit: '900123', phone: '300', email: 't@test.com', active: true, imageUrl: null },
    ]);

    const { result } = await renderHook(() => useAdminSuppliers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.suppliers).toHaveLength(1);
  });

  it('maneja error al cargar proveedores', async () => {
    mockedAdminService.listAllSuppliers.mockRejectedValue(new Error('Server error'));

    const { result } = await renderHook(() => useAdminSuppliers());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('create agrega un proveedor a la lista', async () => {
    mockedAdminService.listAllSuppliers.mockResolvedValue([]);
    mockedAdminService.createSupplier.mockResolvedValue({
      id: '2', name: 'New SA', nit: '900456', phone: '300', email: 'n@test.com', active: true, imageUrl: null,
    });

    const { result } = await renderHook(() => useAdminSuppliers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ nit_proveedor: '900456', razon_social: 'New SA', telefono: '300', email: 'n@test.com' });
    });

    expect(result.current.suppliers).toHaveLength(1);
    expect(result.current.suppliers[0].name).toBe('New SA');
  });

  it('update actualiza un proveedor en la lista', async () => {
    mockedAdminService.listAllSuppliers.mockResolvedValue([
      { id: '1', name: 'Tech SA', nit: '900123', phone: '300', email: 't@test.com', active: true, imageUrl: null },
    ]);
    mockedAdminService.updateSupplier.mockResolvedValue({
      id: '1', name: 'Updated SA', nit: '900123', phone: '300', email: 'u@test.com', active: true, imageUrl: null,
    });

    const { result } = await renderHook(() => useAdminSuppliers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', { nit_proveedor: '900123', razon_social: 'Updated SA', telefono: '300', email: 'u@test.com' });
    });

    expect(result.current.suppliers[0].name).toBe('Updated SA');
  });

  it('remove elimina un proveedor de la lista', async () => {
    mockedAdminService.listAllSuppliers.mockResolvedValue([
      { id: '1', name: 'Tech SA', nit: '900123', phone: '300', email: 't@test.com', active: true, imageUrl: null },
    ]);
    mockedAdminService.deleteSupplier.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminSuppliers());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(result.current.suppliers).toHaveLength(0);
  });
});



