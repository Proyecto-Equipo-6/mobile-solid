import { createOrder, listMyOrders, cancelOrder } from '@/features/cart/services/order.service';

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

describe('order.service - integración', () => {
  describe('createOrder', () => {
    it('sincroniza carrito y crea pedido, retorna Order mapeado', async () => {
      mockFetch({ ok: true });
      mockFetch({
        mensaje: 'Pedido creado',
        pedido: {
          id_pedido: 1,
          total: 35000,
          estado: 'PENDIENTE',
          fecha_pedido: '2026-08-27T10:00:00Z',
          direccion_entrega: 'Calle 10 #5-20',
        },
      });

      const items = [{ productId: '1', name: 'Laptop', price: 30000, quantity: 1 }];
      const order = await createOrder(
        { direccionEntrega: 'Calle 10 #5-20', idMetodoPago: 1 },
        items,
      );

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(order.id).toBe('1');
      expect(order.total).toBe(35000);
      expect(order.status).toBe('pending');
      expect(order.deliveryAddress).toBe('Calle 10 #5-20');
    });

    it('incluye observaciones en el payload', async () => {
      mockFetch({ ok: true });
      mockFetch({
        mensaje: 'Pedido creado',
        pedido: {
          id_pedido: 2,
          total: 15000,
          estado: 'PENDIENTE',
          fecha_pedido: '2026-08-27T10:00:00Z',
          observaciones: 'Urgente',
        },
      });

      await createOrder(
        { direccionEntrega: 'Calle 20', observaciones: 'Urgente', idMetodoPago: 2 },
        [{ productId: '2', name: 'Mouse', price: 15000, quantity: 1 }],
      );

      const postCall = (fetch as jest.Mock).mock.calls[1];
      expect(postCall[1].body).toContain('Urgente');
    });

    it('lanza error cuando el backend falla', async () => {
      mockFetch({ ok: true });
      mockFetch({ error: 'Error interno' }, { ok: false, status: 500 });

      await expect(
        createOrder(
          { direccionEntrega: 'Calle 30', idMetodoPago: 1 },
          [{ productId: '3', name: 'Teclado', price: 50000, quantity: 1 }],
        ),
      ).rejects.toThrow();
    });

    it('lanza error cuando el carrito está vacío', async () => {
      await expect(
        createOrder(
          { direccionEntrega: 'Calle 40', idMetodoPago: 1 },
          [],
        ),
      ).rejects.toThrow();
    });
  });

  describe('listMyOrders', () => {
    it('retorna array de Order mapeados desde /pedidos', async () => {
      mockFetch({
        pedidos: [
          {
            id_pedido: 1,
            total: 35000,
            estado: 'PENDIENTE',
            fecha_pedido: '2026-08-27T10:00:00Z',
          },
          {
            id_pedido: 2,
            total: 20000,
            estado: 'ENTREGADO',
            fecha_pedido: '2026-08-26T09:00:00Z',
          },
        ],
        vacio: false,
      });

      const orders = await listMyOrders();

      expect(orders).toHaveLength(2);
      expect(orders[0].status).toBe('pending');
      expect(orders[1].status).toBe('delivered');
    });

    it('retorna array vacío cuando no hay pedidos', async () => {
      mockFetch({ pedidos: [], vacio: true });

      const orders = await listMyOrders();

      expect(orders).toEqual([]);
    });

    it('mapea correctamente el estado EN_CAMINO a in_transit', async () => {
      mockFetch({
        pedidos: [
          {
            id_pedido: 3,
            total: 45000,
            estado: 'EN_CAMINO',
            fecha_pedido: '2026-08-27T12:00:00Z',
          },
        ],
        vacio: false,
      });

      const orders = await listMyOrders();

      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe('in_transit');
      expect(orders[0].estadoRaw).toBe('EN_CAMINO');
    });

    it('mapea correctamente el estado ASIGNADO a assigned', async () => {
      mockFetch({
        pedidos: [
          {
            id_pedido: 4,
            total: 25000,
            estado: 'ASIGNADO',
            fecha_pedido: '2026-08-27T14:00:00Z',
          },
        ],
        vacio: false,
      });

      const orders = await listMyOrders();

      expect(orders).toHaveLength(1);
      expect(orders[0].status).toBe('assigned');
    });

    it('retorna orders con total mapeado correctamente', async () => {
      mockFetch({
        pedidos: [
          {
            id_pedido: 5,
            total: 99500,
            estado: 'PENDIENTE',
            fecha_pedido: '2026-08-27T15:00:00Z',
          },
        ],
        vacio: false,
      });

      const orders = await listMyOrders();

      expect(orders[0].total).toBe(99500);
    });

    it('lanza error cuando el servidor falla', async () => {
      mockFetch({ error: 'Token inválido' }, { ok: false, status: 401 });

      await expect(listMyOrders()).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('llama PATCH /pedidos/:id/cancel y retorna Order mapeado', async () => {
      mockFetch({
        id_pedido: 1,
        total: 35000,
        estado: 'CANCELADO',
        fecha_pedido: '2026-08-27T10:00:00Z',
      });

      const order = await cancelOrder('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pedidos/1/cancel'),
        expect.objectContaining({ method: 'PATCH' }),
      );
      expect(order.status).toBe('cancelled');
      expect(order.estadoRaw).toBe('CANCELADO');
    });

    it('lanza error cuando el pedido no se puede cancelar', async () => {
      mockFetch(
        { error: 'No se puede cancelar un pedido en estado EN_CAMINO' },
        { ok: false, status: 409 },
      );

      await expect(cancelOrder('2')).rejects.toThrow();
    });

    it('lanza error cuando el pedido no existe', async () => {
      mockFetch({ error: 'Pedido no encontrado' }, { ok: false, status: 404 });

      await expect(cancelOrder('999')).rejects.toThrow();
    });
  });
});
