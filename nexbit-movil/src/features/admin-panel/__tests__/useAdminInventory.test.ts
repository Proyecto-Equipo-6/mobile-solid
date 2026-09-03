import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useAdminInventory, useAdminOrders } from '@/features/admin-panel/hooks/useAdminInventory';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/features/admin-panel/services/admin.service');

const mockedAdminService = jest.mocked(adminService);

const RESUMEN_VACIO = {
  kpis: [],
  ventasPorMes: [],
  pedidosPorEstado: [],
  productosMasVendidos: [],
  topClientes: [],
};

const PRODUCTO_BASE = {
  stock: 10,
  sku: 'SKU-001',
  createdAt: '2026-01-01',
};

const PEDIDO_BASE = {
  estadoRaw: 'PENDIENTE',
  createdAt: '2026-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAdminInventory hook', () => {
  it('carga productos y resumen al montar', async () => {
    mockedAdminService.listProducts.mockResolvedValue([
      { id: '1', name: 'Laptop', price: 2500000, available: true, categoryName: 'Tecnología', ...PRODUCTO_BASE },
    ]);
    mockedAdminService.getAnalyticsSummary.mockResolvedValue({
      ...RESUMEN_VACIO,
      kpis: [
        { id: 'productos', valor: 10, titulo: '', delta: 0, subtitulo: '', tipo: '', serie: [] },
        { id: 'pedidos', valor: 50, titulo: '', delta: 0, subtitulo: '', tipo: '', serie: [] },
        { id: 'ventas', valor: 5000000, titulo: '', delta: 0, subtitulo: '', tipo: '', serie: [] },
      ],
    });

    const { result } = await renderHook(() => useAdminInventory());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.summary?.totalProducts).toBe(10);
    expect(result.current.summary?.totalSales).toBe(5000000);
  });

  it('maneja error al cargar inventario', async () => {
    mockedAdminService.listProducts.mockRejectedValue(new Error('Server error'));
    mockedAdminService.getAnalyticsSummary.mockResolvedValue(RESUMEN_VACIO);

    const { result } = await renderHook(() => useAdminInventory());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('addProduct agrega un producto a la lista', async () => {
    mockedAdminService.listProducts.mockResolvedValue([]);
    mockedAdminService.getAnalyticsSummary.mockResolvedValue(RESUMEN_VACIO);
    mockedAdminService.createProduct.mockResolvedValue({
      id: '2',
      name: 'Mouse',
      price: 80000,
      available: true,
      categoryName: 'Tecnología',
      ...PRODUCTO_BASE,
    });

    const { result } = await renderHook(() => useAdminInventory());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addProduct({
        sku: 'SKU-002',
        categoryId: '1',
        supplierId: '1',
        name: 'Mouse',
        price: 80000,
        available: true,
      });
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe('Mouse');
  });

  it('editProduct actualiza un producto en la lista', async () => {
    mockedAdminService.listProducts.mockResolvedValue([
      { id: '1', name: 'Laptop', price: 2500000, available: true, categoryName: 'Tecnología', ...PRODUCTO_BASE },
    ]);
    mockedAdminService.getAnalyticsSummary.mockResolvedValue(RESUMEN_VACIO);
    mockedAdminService.updateProduct.mockResolvedValue({
      id: '1',
      name: 'Laptop HP',
      price: 2600000,
      available: true,
      categoryName: 'Tecnología',
      ...PRODUCTO_BASE,
    });

    const { result } = await renderHook(() => useAdminInventory());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.editProduct('1', { price: 2600000 });
    });

    expect(result.current.products[0].price).toBe(2600000);
  });

  it('removeProduct elimina un producto de la lista', async () => {
    mockedAdminService.listProducts.mockResolvedValue([
      { id: '1', name: 'Laptop', price: 2500000, available: true, categoryName: 'Tecnología', ...PRODUCTO_BASE },
    ]);
    mockedAdminService.getAnalyticsSummary.mockResolvedValue(RESUMEN_VACIO);
    mockedAdminService.deleteProduct.mockResolvedValue(undefined);

    const { result } = await renderHook(() => useAdminInventory());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeProduct('1');
    });

    expect(result.current.products).toHaveLength(0);
  });
});

describe('useAdminOrders hook', () => {
  it('carga pedidos y repartidores al montar', async () => {
    mockedAdminService.listAdminOrders.mockResolvedValue([
      { id: '1', customerName: 'Juan', status: 'pending', total: 35000, ...PEDIDO_BASE },
    ]);
    mockedAdminService.listDrivers.mockResolvedValue([
      { id: '1', name: 'Carlos', phone: '3001234567', available: true },
    ]);

    const { result } = await renderHook(() => useAdminOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.drivers).toHaveLength(1);
  });

  it('maneja error al cargar pedidos', async () => {
    mockedAdminService.listAdminOrders.mockRejectedValue(new Error('Server error'));
    mockedAdminService.listDrivers.mockResolvedValue([]);

    const { result } = await renderHook(() => useAdminOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Server error');
    });
  });

  it('assignOrder actualiza el pedido en la lista', async () => {
    mockedAdminService.listAdminOrders.mockResolvedValue([
      { id: '1', customerName: 'Juan', status: 'pending', total: 35000, ...PEDIDO_BASE },
    ]);
    mockedAdminService.listDrivers.mockResolvedValue([]);
    mockedAdminService.assignOrder.mockResolvedValue({
      id: '1', customerName: 'Juan', status: 'assigned', total: 35000, ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useAdminOrders());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.assignOrder('1', '5');
    });

    expect(mockedAdminService.assignOrder).toHaveBeenCalledWith('1', '5');
  });

  it('confirmOrder actualiza el estado del pedido', async () => {
    mockedAdminService.listAdminOrders.mockResolvedValue([
      { id: '1', customerName: 'Juan', status: 'pending', total: 35000, ...PEDIDO_BASE },
    ]);
    mockedAdminService.listDrivers.mockResolvedValue([]);
    mockedAdminService.updateOrderStatus.mockResolvedValue({
      id: '1', customerName: 'Juan', status: 'confirmed', total: 35000, ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useAdminOrders());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.confirmOrder('1');
    });

    expect(mockedAdminService.updateOrderStatus).toHaveBeenCalledWith('1', 'CONFIRMADO');
  });

  it('deliverOrder llama deliverOrderWithEvidence', async () => {
    mockedAdminService.listAdminOrders.mockResolvedValue([
      { id: '1', customerName: 'Juan', status: 'pending', total: 35000, ...PEDIDO_BASE },
    ]);
    mockedAdminService.listDrivers.mockResolvedValue([]);
    mockedAdminService.deliverOrderWithEvidence.mockResolvedValue({
      id: '1', customerName: 'Juan', status: 'delivered', total: 35000, ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useAdminOrders());
    await act(async () => {});
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockImage = { uri: 'file:///tmp/evidencia.jpg', base64: 'AAAA', mimeType: 'image/jpeg' };

    await act(async () => {
      await result.current.deliverOrder('1', mockImage, 'Entregado en puerta');
    });

    expect(mockedAdminService.deliverOrderWithEvidence).toHaveBeenCalledWith('1', mockImage, 'Entregado en puerta');
  });
});
