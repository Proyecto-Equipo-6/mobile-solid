import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminCategories } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminCategories hook', () => {
  it('carga categorías al montar', async () => {
    mockedAdminService.listAllCategories.mockResolvedValue([
      { id: '1', name: 'Tecnología', description: 'Productos tech', active: true },
    ]);

    const { result } = await renderHook(() => useAdminCategories());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toHaveLength(1);
  });

  it('maneja error al cargar categorías', async () => {
    mockedAdminService.listAllCategories.mockRejectedValue(new Error('Server error'));

    const { result } = await renderHook(() => useAdminCategories());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('create agrega una categoría a la lista', async () => {
    mockedAdminService.listAllCategories.mockResolvedValue([]);
    mockedAdminService.createCategory.mockResolvedValue({
      id: '2', name: 'Deportes', description: 'Artículos deportivos', active: true,
    });

    const { result } = await renderHook(() => useAdminCategories());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ nombre: 'Deportes', descripcion: 'Artículos deportivos', estado: '1' });
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Deportes');
  });

  it('update actualiza una categoría en la lista', async () => {
    mockedAdminService.listAllCategories.mockResolvedValue([
      { id: '1', name: 'Tecnología', description: 'Tech', active: true },
    ]);
    mockedAdminService.updateCategory.mockResolvedValue({
      id: '1', name: 'Tecnología Actualizada', description: 'Actualizado', active: true,
    });

    const { result } = await renderHook(() => useAdminCategories());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.update('1', { nombre: 'Tecnología Actualizada', descripcion: 'Actualizado', estado: '1' });
    });

    expect(result.current.categories[0].name).toBe('Tecnología Actualizada');
  });

  it('remove elimina una categoría de la lista', async () => {
    mockedAdminService.listAllCategories.mockResolvedValue([
      { id: '1', name: 'Tecnología', description: 'Tech', active: true },
    ]);
    mockedAdminService.deleteCategory.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminCategories());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.remove('1');
    });

    expect(result.current.categories).toHaveLength(0);
  });
});
