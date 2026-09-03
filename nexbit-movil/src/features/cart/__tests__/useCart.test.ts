import React from 'react';
import { render, act, cleanup } from '@testing-library/react-native';
import { CartProvider, useCart } from '@/features/cart/hooks/CartProvider';

let latestCart: ReturnType<typeof useCart> | null = null;

function CartTestConsumer() {
  latestCart = useCart();
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  latestCart = null;
});

afterEach(() => {
  cleanup();
});

describe('useCart hook', () => {
  it('inicia con carrito vacío', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    expect(latestCart).not.toBeNull();
    expect(latestCart!.items).toEqual([]);
    expect(latestCart!.count).toBe(0);
    expect(latestCart!.totals.subtotal).toBe(0);
  });

  it('addItem agrega un producto al carrito', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
    });

    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.items[0].quantity).toBe(1);
    expect(latestCart!.count).toBe(1);
  });

  it('addItem incrementa cantidad si el producto ya existe', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
    });

    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.items[0].quantity).toBe(2);
    expect(latestCart!.count).toBe(2);
  });

  it('removeItem elimina un producto del carrito', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.removeItem('1');
    });

    expect(latestCart!.items).toHaveLength(0);
    expect(latestCart!.count).toBe(0);
  });

  it('updateQuantity actualiza la cantidad', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.updateQuantity('1', 5);
    });

    expect(latestCart!.items[0].quantity).toBe(5);
    expect(latestCart!.count).toBe(5);
  });

  it('updateQuantity con 0 elimina el producto', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.updateQuantity('1', 0);
    });

    expect(latestCart!.items).toHaveLength(0);
  });

  it('clear vacía el carrito', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.addItem({ productId: '2', name: 'Mouse', price: 80000 });
    });

    await act(async () => {
      latestCart!.clear();
    });

    expect(latestCart!.items).toHaveLength(0);
    expect(latestCart!.count).toBe(0);
  });

  it('calcula totales correctamente con delivery fee', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.addItem({ productId: '2', name: 'Mouse', price: 80000 });
    });

    expect(latestCart!.totals.subtotal).toBe(2580000);
    expect(latestCart!.totals.deliveryFee).toBe(5000);
    expect(latestCart!.totals.total).toBe(2585000);
  });

  it('updateQuantity con cantidad negativa elimina el producto (quantity <= 0)', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.updateQuantity('1', -3);
    });

    expect(latestCart!.items).toHaveLength(0);
    expect(latestCart!.count).toBe(0);
  });

  it('updateQuantity recalcula totales correctamente', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
    });

    expect(latestCart!.totals.subtotal).toBe(2500000);

    await act(async () => {
      latestCart!.updateQuantity('1', 3);
    });

    expect(latestCart!.totals.subtotal).toBe(7500000);
    expect(latestCart!.totals.total).toBe(7505000);
  });

  it('updateQuantity con producto inexistente no modifica el carrito', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.updateQuantity('999', 5);
    });

    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.items[0].quantity).toBe(1);
  });

  it('removeItem recalcula count y totales', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.addItem({ productId: '2', name: 'Mouse', price: 80000 });
    });

    expect(latestCart!.count).toBe(2);
    expect(latestCart!.totals.subtotal).toBe(2580000);

    await act(async () => {
      latestCart!.removeItem('1');
    });

    expect(latestCart!.count).toBe(1);
    expect(latestCart!.totals.subtotal).toBe(80000);
    expect(latestCart!.totals.total).toBe(85000);
  });

  it('removeItem con producto inexistente no modifica el carrito', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
      latestCart!.removeItem('999');
    });

    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.count).toBe(1);
  });

  it('addItem recalcula count y totales', async () => {
    await act(async () => {
      await render(
        React.createElement(CartProvider, null,
          React.createElement(CartTestConsumer)
        )
      );
    });

    await act(async () => {
      latestCart!.addItem({ productId: '1', name: 'Laptop', price: 2500000 });
    });

    expect(latestCart!.count).toBe(1);
    expect(latestCart!.totals.subtotal).toBe(2500000);

    await act(async () => {
      latestCart!.addItem({ productId: '2', name: 'Mouse', price: 80000 });
    });

    expect(latestCart!.count).toBe(2);
    expect(latestCart!.totals.subtotal).toBe(2580000);
    expect(latestCart!.totals.total).toBe(2585000);
  });
});
