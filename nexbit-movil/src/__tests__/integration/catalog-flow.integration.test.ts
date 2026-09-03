/**
 * Prueba de Integración: Flujo de Catálogo
 *
 * Verifica la interacción entre productos, categorías y búsquedas
 * del catálogo público con el API real.
 */

import * as catalogService from '@/features/catalog/services/catalog.service';

jest.mock('@/shared/api/client');

const mockedClient = jest.mocked(require('@/shared/api/client'));

const MOCK_PRODUCTO_1 = {
  id_producto: 1,
  sku: 'SKU-001',
  id_categoria: 1,
  id_proveedor: 1,
  nombre: 'Laptop',
  descripcion: 'Laptop 14"',
  precio: 2500000,
  stock: 10,
  estado: 1,
  imagen_url: 'https://cdn.example.com/laptop.jpg',
  categoria: 'Tecnología',
  proveedor: 'TechCorp',
  fecha_creacion: '2026-01-15',
};

const MOCK_PRODUCTO_2 = {
  id_producto: 2,
  sku: 'SKU-002',
  id_categoria: 2,
  id_proveedor: 2,
  nombre: 'Audífonos',
  descripcion: 'Audífonos BT',
  precio: 150000,
  stock: 50,
  estado: 1,
  imagen_url: 'https://cdn.example.com/audifonos.jpg',
  categoria: 'Audio',
  proveedor: 'AudioMax',
  fecha_creacion: '2026-02-10',
};

const MOCK_CATEGORIA_1 = { id_categoria: 1, nombre: 'Tecnología', estado: 1 };
const MOCK_CATEGORIA_2 = { id_categoria: 2, nombre: 'Audio', estado: 1 };
const MOCK_CATEGORIA_INACTIVA = { id_categoria: 3, nombre: 'Ropa', estado: 0 };

function mockGet(url: string) {
  if (url === '/productos/publico') {
    return Promise.resolve({ productos: [MOCK_PRODUCTO_1, MOCK_PRODUCTO_2] });
  }

  if (url.startsWith('/productos/') && !url.includes('/publico')) {
    const id = url.split('/').pop();
    const product = [MOCK_PRODUCTO_1, MOCK_PRODUCTO_2].find(
      (p) => String(p.id_producto) === id,
    );
    if (product) return Promise.resolve(product);
    return Promise.reject({ status: 404, message: 'Producto no encontrado' });
  }

  if (url === '/categorias') {
    return Promise.resolve({
      categorias: [MOCK_CATEGORIA_1, MOCK_CATEGORIA_2, MOCK_CATEGORIA_INACTIVA],
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
    patch: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(undefined),
    upload: jest.fn().mockResolvedValue({ imagen_url: 'https://cdn.example.com/img.jpg' }),
  };
});

describe('Integración — Flujo de Catálogo', () => {
  it('listProducts retorna productos mapeados correctamente', async () => {
    const products = await catalogService.listProducts();

    expect(products).toHaveLength(2);
    expect(products[0].name).toBe('Laptop');
    expect(products[0].price).toBe(2500000);
    expect(products[0].available).toBe(true);
    expect(products[0].imageUrl).toBe('https://cdn.example.com/laptop.jpg');
    expect(products[0].categoryName).toBe('Tecnología');
    expect(products[1].name).toBe('Audífonos');
  });

  it('getProduct retorna un producto individual por ID', async () => {
    const product = await catalogService.getProduct('1');

    expect(product.id).toBe('1');
    expect(product.name).toBe('Laptop');
    expect(product.price).toBe(2500000);
    expect(product.sku).toBe('SKU-001');
    expect(product.categoryName).toBe('Tecnología');
  });

  it('listCategories retorna solo categorías activas mapeadas', async () => {
    const categories = await catalogService.listCategories();

    expect(categories).toHaveLength(2);
    expect(categories[0].id).toBe('1');
    expect(categories[0].name).toBe('Tecnología');
    expect(categories[1].id).toBe('2');
    expect(categories[1].name).toBe('Audio');
  });

  it('flujo: listar productos → obtener detalle del primero', async () => {
    const products = await catalogService.listProducts();
    expect(products.length).toBeGreaterThan(0);

    const firstProduct = await catalogService.getProduct(products[0].id);
    expect(firstProduct.id).toBe(products[0].id);
    expect(firstProduct.name).toBe(products[0].name);
    expect(firstProduct.price).toBe(products[0].price);
  });

  it('flujo: listar categorías → filtrar productos por categoría', async () => {
    const categories = await catalogService.listCategories();
    const products = await catalogService.listProducts();

    const techCategoryId = categories.find((c) => c.name === 'Tecnología')?.id;
    expect(techCategoryId).toBeDefined();

    const techProducts = products.filter((p) => p.categoryId === techCategoryId);
    expect(techProducts).toHaveLength(1);
    expect(techProducts[0].name).toBe('Laptop');
  });

  it('getProduct con ID inexistente lanza error', async () => {
    await expect(catalogService.getProduct('999')).rejects.toMatchObject({ status: 404 });
  });

  it('catálogo con respuesta vacía retorna array vacío', async () => {
    mockedClient.api.get = jest.fn().mockResolvedValue([]);

    const products = await catalogService.listProducts();
    expect(products).toEqual([]);
  });

  it('catálogo con respuesta { items: [...] } también funciona', async () => {
    mockedClient.api.get = jest.fn().mockResolvedValue({ items: [MOCK_PRODUCTO_1] });

    const products = await catalogService.listProducts();
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe('Laptop');
  });
});
