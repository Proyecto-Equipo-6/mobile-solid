import {
  getDashboard,
  getOrderDetail,
  updateDeliveryStatus,
  entregarPedido,
  marcarNoEntregado,
} from '@/features/delivery/services/delivery.service';

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

describe('delivery.service - integración', () => {
  describe('getDashboard', () => {
    it('retorna DriverDashboard mapeado desde /repartidor/dashboard', async () => {
      mockFetch({
        conteoDelDia: 5,
        pedidoActivo: {
          id_pedido: 1,
          cliente_nombre: 'Juan',
          direccion_entrega: 'Calle 10',
          estado: 'EN_CAMINO',
          fecha_pedido: '2026-08-27T10:00:00Z',
        },
        pedidosEnCola: [
          {
            id_pedido: 2,
            cliente_nombre: 'Ana',
            direccion_entrega: 'Calle 20',
            estado: 'ASIGNADO',
            fecha_pedido: '2026-08-27T11:00:00Z',
          },
        ],
      });

      const dashboard = await getDashboard();

      expect(dashboard.conteoDelDia).toBe(5);
      expect(dashboard.pedidoActivo).not.toBeNull();
      expect(dashboard.pedidoActivo?.id).toBe('1');
      expect(dashboard.pedidosEnCola).toHaveLength(1);
    });

    it('maneja respuesta con wrapper { data: {...} }', async () => {
      mockFetch({
        data: {
          conteoDelDia: 3,
          pedidoActivo: null,
          pedidosEnCola: [],
        },
      });

      const dashboard = await getDashboard();

      expect(dashboard.conteoDelDia).toBe(3);
      expect(dashboard.pedidoActivo).toBeNull();
    });

    it('lanza error cuando el servidor falla', async () => {
      mockFetch({ error: 'No autorizado' }, { ok: false, status: 401 });

      await expect(getDashboard()).rejects.toThrow();
    });
  });

  describe('getOrderDetail', () => {
    it('retorna DeliveryOrder mapeado por ID', async () => {
      mockFetch({
        id_pedido: 5,
        clienteNombre: 'Carlos',
        direccion_entrega: 'Calle 30',
        estado: 'EN_CAMINO',
        fecha_pedido: '2026-08-27T10:00:00Z',
        productos: [{ nombre: 'Laptop', cantidad: 1, precio: 3000000 }],
      });

      const order = await getOrderDetail('1');

      expect(order.id).toBe('5');
      expect(order.customerName).toBe('Carlos');
    });

    it('lanza error cuando el pedido no existe', async () => {
      mockFetch({ error: 'No encontrado' }, { ok: false, status: 404 });

      await expect(getOrderDetail('999')).rejects.toThrow();
    });
  });

  describe('updateDeliveryStatus', () => {
    it('llama PATCH con el estado y observación', async () => {
      mockFetch({
        id_pedido: 1,
        estado: 'NO_ENTREGADO',
        fecha_pedido: '2026-08-27T10:00:00Z',
      });

      await updateDeliveryStatus('1', 'NO_ENTREGADO', 'EN_CAMINO', {
        observacion: 'No encontré al cliente',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/repartidor/pedidos/1/estado'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });

  describe('entregarPedido', () => {
    it('llama updateDeliveryStatus con ENTREGADO y comprobante', async () => {
      mockFetch({
        id_pedido: 1,
        estado: 'ENTREGADO',
        fecha_pedido: '2026-08-27T10:00:00Z',
      });

      await entregarPedido('1', 'https://comprobante.url/foto.jpg');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/repartidor/pedidos/1/estado'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });

  describe('marcarNoEntregado', () => {
    it('llama updateDeliveryStatus con NO_ENTREGADO y observación', async () => {
      mockFetch({
        id_pedido: 1,
        estado: 'NO_ENTREGADO',
        fecha_pedido: '2026-08-27T10:00:00Z',
      });

      await marcarNoEntregado('1', 'Cerrado');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/repartidor/pedidos/1/estado'),
        expect.objectContaining({ method: 'PATCH' }),
      );
    });
  });
});
