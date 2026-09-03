import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useDriverOrders } from '@/features/delivery/hooks/useDriverOrders';
import * as deliveryService from '@/features/delivery/services/delivery.service';

jest.mock('@/features/delivery/services/delivery.service');

const mockedDeliveryService = jest.mocked(deliveryService);

const PEDIDO_BASE = {
  total: 35000,
  estadoRaw: 'EN_CAMINO',
  createdAt: '2026-01-01',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useDriverOrders hook', () => {
  it('carga dashboard al montar', async () => {
    mockedDeliveryService.getDashboard.mockResolvedValue({
      conteoDelDia: 5,
      pedidoActivo: null,
      pedidosEnCola: [],
    });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dashboard?.conteoDelDia).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('carga detalle del pedido activo si existe', async () => {
    mockedDeliveryService.getDashboard.mockResolvedValue({
      conteoDelDia: 3,
      pedidoActivo: {
        id: '1',
        customerName: 'Juan',
        address: 'Calle 10',
        status: 'in_transit',
        products: [],
        ...PEDIDO_BASE,
      },
      pedidosEnCola: [],
    });
    mockedDeliveryService.getOrderDetail.mockResolvedValue({
      id: '1',
      customerName: 'Juan',
      address: 'Calle 10',
      status: 'in_transit',
      products: [{ id: '1', name: 'Laptop', quantity: 1, unitPrice: 3000000, subtotal: 3000000 }],
      ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedDeliveryService.getOrderDetail).toHaveBeenCalledWith('1');
    expect(result.current.dashboard?.pedidoActivo?.products).toHaveLength(1);
  });

  it('maneja error al cargar dashboard', async () => {
    mockedDeliveryService.getDashboard.mockRejectedValue(new Error('Network error'));

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('startDelivery llama updateDeliveryStatus y recarga', async () => {
    mockedDeliveryService.getDashboard.mockResolvedValue({
      conteoDelDia: 0,
      pedidoActivo: null,
      pedidosEnCola: [],
    });
    mockedDeliveryService.updateDeliveryStatus.mockResolvedValue({
      id: '1',
      customerName: 'Juan',
      address: 'Calle 10',
      status: 'in_transit',
      products: [],
      ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.startDelivery('1');
    });

    expect(mockedDeliveryService.updateDeliveryStatus).toHaveBeenCalledWith('1', 'EN_CAMINO', 'ASIGNADO');
  });

  it('deliverOrder llama entregarPedido', async () => {
    mockedDeliveryService.getDashboard.mockResolvedValue({
      conteoDelDia: 0,
      pedidoActivo: null,
      pedidosEnCola: [],
    });
    mockedDeliveryService.entregarPedido.mockResolvedValue({
      id: '1',
      customerName: 'Juan',
      address: 'Calle 10',
      status: 'delivered',
      products: [],
      ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deliverOrder('1', 'https://comprobante.url');
    });

    expect(mockedDeliveryService.entregarPedido).toHaveBeenCalledWith('1', 'https://comprobante.url');
  });

  it('markNotDelivered llama marcarNoEntregado', async () => {
    mockedDeliveryService.getDashboard.mockResolvedValue({
      conteoDelDia: 0,
      pedidoActivo: null,
      pedidosEnCola: [],
    });
    mockedDeliveryService.marcarNoEntregado.mockResolvedValue({
      id: '1',
      customerName: 'Juan',
      address: 'Calle 10',
      status: 'not_delivered',
      products: [],
      ...PEDIDO_BASE,
    });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.markNotDelivered('1', 'No encontrado');
    });

    expect(mockedDeliveryService.marcarNoEntregado).toHaveBeenCalledWith('1', 'No encontrado');
  });

  it('reload recarga el dashboard', async () => {
    mockedDeliveryService.getDashboard
      .mockResolvedValueOnce({
        conteoDelDia: 3,
        pedidoActivo: null,
        pedidosEnCola: [],
      })
      .mockResolvedValueOnce({
        conteoDelDia: 5,
        pedidoActivo: null,
        pedidosEnCola: [],
      });

    const { result } = await renderHook(() => useDriverOrders());
    await act(async () => {});

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dashboard?.conteoDelDia).toBe(3);

    await act(async () => {
      result.current.reload();
    });

    await waitFor(() => {
      expect(result.current.dashboard?.conteoDelDia).toBe(5);
    });
  });
});
