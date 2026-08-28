import { agregarAlCarrito, sincronizarCarrito, verCarrito } from '@/features/cart/services/cart.service';

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

describe('cart.service - integración', () => {
  describe('verCarrito', () => {
    it('llama GET /carrito', async () => {
      mockFetch({ items: [] });

      await verCarrito();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito'),
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('agregarAlCarrito', () => {
    it('llama POST /carrito con productoId y cantidad por defecto', async () => {
      mockFetch({ mensaje: 'Agregado' });

      await agregarAlCarrito(10);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ productoId: 10, cantidad: 1 }),
        }),
      );
    });

    it('llama POST /carrito con cantidad personalizada', async () => {
      mockFetch({ mensaje: 'Agregado' });

      await agregarAlCarrito(10, 3);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/carrito'),
        expect.objectContaining({
          body: JSON.stringify({ productoId: 10, cantidad: 3 }),
        }),
      );
    });

    it('lanza error cuando el producto no existe', async () => {
      mockFetch({ error: 'Producto no encontrado' }, { ok: false, status: 404 });

      await expect(agregarAlCarrito(999)).rejects.toThrow();
    });
  });

  describe('sincronizarCarrito', () => {
    it('envía cada item del carrito al backend', async () => {
      mockFetch({ ok: true });
      mockFetch({ ok: true });
      mockFetch({ ok: true });

      const items = [
        { productId: '1', name: 'A', price: 1000, quantity: 2 },
        { productId: '2', name: 'B', price: 2000, quantity: 1 },
        { productId: '3', name: 'C', price: 500, quantity: 5 },
      ];

      await sincronizarCarrito(items);

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('lanza error si algún item falla', async () => {
      mockFetch({ ok: true });
      mockFetch({ error: 'No encontrado' }, { ok: false, status: 404 });

      const items = [
        { productId: '1', name: 'A', price: 1000, quantity: 1 },
        { productId: '99', name: 'X', price: 500, quantity: 1 },
      ];

      await expect(sincronizarCarrito(items)).rejects.toThrow();
    });

    it('no envía nada si el array está vacío', async () => {
      await sincronizarCarrito([]);

      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
