import { listProducts, listCategories, getProduct } from '@/features/catalog/services/catalog.service';

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

describe('catalog.service - integración', () => {
  describe('listProducts', () => {
    it('retorna array de Product mapeados desde /productos/publico', async () => {
      mockFetch([
        {
          id_producto: 1,
          sku: 'SKU-001',
          nombre: 'Laptop HP',
          descripcion: 'Laptop 15 pulgadas',
          precio: 2500000,
          stock: 10,
          estado: 1,
          categoria: 'Tecnología',
        },
        {
          id_producto: 2,
          sku: 'SKU-002',
          nombre: 'Mouse Logitech',
          precio: 80000,
          stock: 50,
          estado: 1,
        },
      ]);

      const products = await listProducts();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/publico'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Laptop HP');
      expect(products[0].price).toBe(2500000);
      expect(products[0].available).toBe(true);
    });

    it('retorna array vacío cuando la respuesta es un array vacío', async () => {
      mockFetch([]);

      const products = await listProducts();

      expect(products).toEqual([]);
    });

    it('maneja respuesta con wrapper { items: [...] }', async () => {
      mockFetch({
        items: [
          { id_producto: 1, sku: 'SKU-001', nombre: 'Teclado', precio: 50000, stock: 20, estado: 1 },
        ],
      });

      const products = await listProducts();

      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('Teclado');
    });

    it('maneja respuesta con wrapper { productos: [...] }', async () => {
      mockFetch({
        productos: [
          { id_producto: 1, sku: 'SKU-001', nombre: 'Monitor', precio: 800000, stock: 5, estado: 1 },
        ],
      });

      const products = await listProducts();

      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('Monitor');
    });

    it('lanza error cuando el servidor falla', async () => {
      mockFetch({ error: 'Error interno' }, { ok: false, status: 500 });

      await expect(listProducts()).rejects.toThrow();
    });
  });

  describe('listCategories', () => {
    it('retorna categorías activas (estado=1) mapeadas', async () => {
      mockFetch([
        { id_categoria: 1, nombre: 'Tecnología', estado: 1 },
        { id_categoria: 2, nombre: 'Ropa', estado: 0 },
        { id_categoria: 3, nombre: 'Hogar', estado: 1 },
      ]);

      const categories = await listCategories();

      expect(categories).toHaveLength(2);
      expect(categories[0]).toEqual({ id: '1', name: 'Tecnología' });
      expect(categories[1]).toEqual({ id: '3', name: 'Hogar' });
    });

    it('filtra categorías inactivas (estado=0)', async () => {
      mockFetch([
        { id_categoria: 1, nombre: 'Activa', estado: 1 },
        { id_categoria: 2, nombre: 'Inactiva', estado: 0 },
      ]);

      const categories = await listCategories();

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Activa');
    });

    it('maneja respuesta con wrapper { categorias: [...] }', async () => {
      mockFetch({
        categorias: [
          { id_categoria: 1, nombre: 'Deportes', estado: 1 },
        ],
      });

      const categories = await listCategories();

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Deportes');
    });
  });

  describe('getProduct', () => {
    it('retorna un Product mapeado por ID', async () => {
      mockFetch({
        id_producto: 5,
        sku: 'SKU-005',
        nombre: 'Audífonos',
        precio: 150000,
        stock: 25,
        estado: 1,
        categoria: 'Audio',
      });

      const product = await getProduct('5');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/5'),
        expect.objectContaining({ method: 'GET' }),
      );
      expect(product.name).toBe('Audífonos');
      expect(product.id).toBe('5');
    });
  });
});
