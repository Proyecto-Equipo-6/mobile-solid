/**
 * Prueba de Integración: Flujo Carrito → Orden
 *
 * Verifica la interacción completa: agregar productos al carrito,
 * sincronizar con backend, crear orden y listar órdenes.
 */

import React from 'react';
import { render, act, cleanup } from '@testing-library/react-native';
import { CartProvider } from '@/features/cart/hooks/CartProvider';
import { useCart } from '@/features/cart/hooks/useCart';
import * as orderService from '@/features/cart/services/order.service';

jest.mock('@/shared/api/client');
jest.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: '1' } }),
}));

const mockedClient = jest.mocked(require('@/shared/api/client'));

const MOCK_PEDIDO = {
  id_pedido: 100,
  estado: 'PENDIENTE',
  total: 2500000,
  fecha_pedido: '2026-01-15',
  direccion_entrega: 'Calle 10',
  observaciones: 'Urgente',
};

const MOCK_CART_ITEMS = [
  {
    id_producto: 1,
    nombre: 'Laptop',
    precio: 2500000,
    cantidad: 1,
    imagen_url: 'https://example.com/laptop.jpg',
  },
];

function mockPost(url: string, body: unknown) {
  if (url === '/carrito') {
    return Promise.resolve({ mensaje: 'Producto agregado' });
  }

  if (url === '/pedidos') {
    const pedido = {
      id_pedido: Date.now(),
      estado: 'PENDIENTE',
      total: 2500000,
      fecha_pedido: new Date().toISOString(),
      ...(body as Record<string, unknown>),
    };
    return Promise.resolve({ mensaje: 'Pedido creado', pedido });
  }

  return Promise.reject({ status: 404 });
}

function mockGet(url: string) {
  if (url === '/pedidos') {
    return Promise.resolve({ pedidos: [MOCK_PEDIDO] });
  }
  if (url === '/carrito') {
    return Promise.resolve({ items: MOCK_CART_ITEMS });
  }
  return Promise.reject({ status: 404 });
}

beforeEach(() => {
  jest.clearAllMocks();
  latestCart = null;

  mockedClient.api = {
    get: jest.fn(mockGet),
    post: jest.fn(mockPost),
    put: jest.fn().mockResolvedValue({}),
    patch: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(undefined),
    upload: jest.fn().mockResolvedValue({ imagen_url: 'https://cdn.example.com/img.jpg' }),
  };
});

afterEach(() => {
  cleanup();
});

let latestCart: ReturnType<typeof useCart> | null = null;

function CartTestConsumer() {
  latestCart = useCart();
  return null;
}

describe('Integración — Flujo Carrito → Orden', () => {
  it('agregar producto al carrito + calcular totales', async () => {
    await act(async () => {
      render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({
        productId: '1',
        name: 'Laptop',
        price: 2500000,
        imageUrl: 'https://example.com/laptop.jpg',
      });
    });

    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.totals.total).toBe(2500000 + 5000);
  });

  it('crear orden con items → obtener pedido en lista', async () => {
    const items = [{
      productId: '1',
      name: 'Laptop',
      price: 2500000,
      quantity: 1,
    }];

    const order = await orderService.createOrder(
      {
        direccionEntrega: 'Calle 10',
        observaciones: 'Urgente',
        idMetodoPago: 1,
      },
      items,
    );

    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
    expect(order.total).toBe(2500000);

    const orders = await orderService.listMyOrders();
    expect(orders.length).toBeGreaterThan(0);
  });

  it('sincronizar carrito llama al API por cada item', async () => {
    const items = [
      { productId: '1', name: 'Laptop', price: 2500000, quantity: 1 },
      { productId: '2', name: 'Mouse', price: 50000, quantity: 2 },
    ];

    await orderService.createOrder(
      { direccionEntrega: 'Calle 10', idMetodoPago: 1 },
      items,
    );

    expect(mockedClient.api.post).toHaveBeenCalledWith(
      '/carrito',
      { productoId: 1, cantidad: 1 },
    );
    expect(mockedClient.api.post).toHaveBeenCalledWith(
      '/carrito',
      { productoId: 2, cantidad: 2 },
    );
  });

  it('crear orden con items vacíos igual crea el pedido', async () => {
    const order = await orderService.createOrder(
      { direccionEntrega: 'Calle 10', idMetodoPago: 1 },
      [],
    );
    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
  });

  it('listar pedidos vacío retorna array', async () => {
    mockedClient.api.get = jest.fn().mockResolvedValue({ pedidos: [] });

    const orders = await orderService.listMyOrders();
    expect(orders).toEqual([]);
  });
});
