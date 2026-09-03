import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import * as catalogService from '@/features/catalog/services/catalog.service';

jest.mock('@/features/catalog/services/catalog.service');

const mockedCatalogService = jest.mocked(catalogService);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProducts hook', () => {
  it('carga productos y categorías al montar', async () => {
    mockedCatalogService.listProducts.mockResolvedValue([
{ id: '1', name: 'Laptop', price: 2500000, available: true, categoryName: 'Tecnología', stock: 10, sku: 'LAP-1', createdAt: '2026-01-01' },
    ]);
    mockedCatalogService.listCategories.mockResolvedValue([
      { id: '1', name: 'Tecnología' },
    ]);

    const { result } = await renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.categories).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('maneja error al cargar catálogo', async () => {
    mockedCatalogService.listProducts.mockRejectedValue(new Error('Network error'));
    mockedCatalogService.listCategories.mockResolvedValue([]);

    const { result } = await renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('filtra productos por categoría seleccionada', async () => {
    mockedCatalogService.listProducts.mockResolvedValue([
{ id: '1', name: 'Laptop', price: 2500000, available: true, categoryName: 'Tecnología', stock: 10, sku: 'LAP-1', createdAt: '2026-01-01' },
      { id: '2', name: 'Camisa', price: 50000, available: true, categoryName: 'Ropa', stock: 5, sku: 'CAM-1', createdAt: '2026-01-01' },
    ]);
    mockedCatalogService.listCategories.mockResolvedValue([
      { id: '1', name: 'Tecnología' },
      { id: '2', name: 'Ropa' },
    ]);

    const { result } = await renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      result.current.setSelectedCategory('1');
    });

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
    });

    expect(result.current.products[0].name).toBe('Laptop');
  });

  it('reload recarga los datos', async () => {
    mockedCatalogService.listProducts.mockResolvedValue([]);
    mockedCatalogService.listCategories.mockResolvedValue([]);

    const { result } = await renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockedCatalogService.listProducts.mockResolvedValue([
      { id: '1', name: 'Nuevo', price: 1000, available: true, categoryName: 'Otros', stock: 3, sku: 'NUE-1', createdAt: '2026-01-01' },
    ]);

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
  });
});

