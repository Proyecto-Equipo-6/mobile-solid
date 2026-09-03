/**
 * Prueba de Integración: Flujo del Repartidor
 *
 * Verifica el flujo completo del repartidor: dashboard → detalle → entregar → no entregado.
 */

import * as deliveryService from '@/features/delivery/services/delivery.service';

jest.mock('@/shared/api/client');

const mockedClient = jest.mocked(require('@/shared/api/client'));

const MOCK_PEDIDO_ACTIVO = {
  id_pedido: 1,
  clienteNombre: 'Carlos Cliente',
  clienteTelefono: '3001234567',
  direccion_entrega: 'Calle 10 #5-20',
  total: 2500000,
  estado: 'EN_CAMINO',
  fecha_pedido: '2026-01-15',
  comprobante_url: null,
  productos: [
    {
      id_producto: 1,
      nombre: 'Laptop',
      cantidad: 1,
      precio_unitario: 2500000,
      subtotal: 2500000,
    },
  ],
};

const MOCK_PEDIDO_COLA = {
  id_pedido: 2,
  clienteNombre: 'Ana Cliente',
  clienteTelefono: '3009876543',
  direccion_entrega: 'Carrera 5 #15-30',
  total: 150000,
  estado: 'ASIGNADO',
  fecha_pedido: '2026-01-16',
};

function mockGet(url: string) {
  if (url === '/repartidor/dashboard') {
    return Promise.resolve({
      conteoDelDia: 5,
      pedidoActivo: MOCK_PEDIDO_ACTIVO,
      pedidosEnCola: [MOCK_PEDIDO_COLA],
    });
  }

  if (url.startsWith('/repartidor/pedidos/') && url.endsWith('/detalle')) {
    const id = url.split('/').at(-2);
    if (id === '1') return Promise.resolve(MOCK_PEDIDO_ACTIVO);
    return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
  }

  return Promise.reject({ status: 404 });
}

function mockPatch(url: string) {
  if (url.startsWith('/repartidor/pedidos/') && url.endsWith('/estado')) {
    return Promise.resolve({
      ...MOCK_PEDIDO_ACTIVO,
      estado: 'ENTREGADO',
    });
  }
  return Promise.reject({ status: 404 });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedClient.api = {
    get: jest.fn(mockGet),
    post: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    patch: jest.fn(mockPatch),
    delete: jest.fn().mockResolvedValue(undefined),
    upload: jest.fn().mockResolvedValue({ comprobante_url: 'https://cdn.example.com/comprobante.jpg' }),
  };
});

describe('Integración — Flujo del Repartidor', () => {
  it('dashboard retorna conteo, pedido activo y cola', async () => {
    const dashboard = await deliveryService.getDashboard();

    expect(dashboard.conteoDelDia).toBe(5);
    expect(dashboard.pedidoActivo).not.toBeNull();
    expect(dashboard.pedidoActivo!.id).toBe('1');
    expect(dashboard.pedidoActivo!.customerName).toBe('Carlos Cliente');
    expect(dashboard.pedidoActivo!.status).toBe('in_transit');
    expect(dashboard.pedidosEnCola).toHaveLength(1);
    expect(dashboard.pedidosEnCola[0].customerName).toBe('Ana Cliente');
    expect(dashboard.pedidosEnCola[0].status).toBe('assigned');
  });

  it('getOrderDetail retorna detalle con productos', async () => {
    const detail = await deliveryService.getOrderDetail('1');

    expect(detail.id).toBe('1');
    expect(detail.customerName).toBe('Carlos Cliente');
    expect(detail.customerPhone).toBe('3001234567');
    expect(detail.address).toBe('Calle 10 #5-20');
    expect(detail.total).toBe(2500000);
    expect(detail.status).toBe('in_transit');
    expect(detail.products).toHaveLength(1);
    expect(detail.products![0].name).toBe('Laptop');
    expect(detail.products![0].quantity).toBe(1);
    expect(detail.products![0].unitPrice).toBe(2500000);
  });

  it('entregarPedido cambia estado a ENTREGADO', async () => {
    const result = await deliveryService.entregarPedido('1', 'https://cdn.example.com/comprobante.jpg');

    expect(result.id).toBe('1');
    expect(result.status).toBe('delivered');
    expect(mockedClient.api.patch).toHaveBeenCalledWith(
      '/repartidor/pedidos/1/estado',
      expect.objectContaining({ estado: 'ENTREGADO', estadoAnterior: 'EN_CAMINO' }),
    );
  });

  it('marcarNoEntregado cambia estado a NO_ENTREGADO', async () => {
    mockedClient.api.patch = jest.fn().mockResolvedValue({
      ...MOCK_PEDIDO_ACTIVO,
      estado: 'NO_ENTREGADO',
    });

    const result = await deliveryService.marcarNoEntregado('1', 'Cliente no disponible');

    expect(result.id).toBe('1');
    expect(result.status).toBe('not_delivered');
    expect(mockedClient.api.patch).toHaveBeenCalledWith(
      '/repartidor/pedidos/1/estado',
      expect.objectContaining({ estado: 'NO_ENTREGADO', observacion: 'Cliente no disponible' }),
    );
  });

  it('flujo completo: dashboard → detalle → entregar con comprobante', async () => {
    const dashboard = await deliveryService.getDashboard();
    expect(dashboard.pedidoActivo).not.toBeNull();

    const detail = await deliveryService.getOrderDetail(dashboard.pedidoActivo!.id);
    expect(detail.status).toBe('in_transit');

    const delivered = await deliveryService.entregarPedido(detail.id, 'https://cdn.example.com/evidencia.jpg');
    expect(delivered.status).toBe('delivered');
  });

  it('dashboard sin pedido activo retorna null', async () => {
    mockedClient.api.get = jest.fn().mockResolvedValue({
      conteoDelDia: 0,
      pedidoActivo: null,
      pedidosEnCola: [],
    });

    const dashboard = await deliveryService.getDashboard();
    expect(dashboard.pedidoActivo).toBeNull();
    expect(dashboard.pedidosEnCola).toEqual([]);
  });
});
