import { useCallback, useState } from 'react';

import type { CartItem, CartTotals } from '@/features/cart/types/cart.types';

const DELIVERY_FEE = 5000;

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.productId);
      if (existing) {
        return current.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const totals: CartTotals = items.reduce<CartTotals>(
    (acc, item) => {
      const subtotal = acc.subtotal + item.price * item.quantity;
      return { subtotal, deliveryFee: DELIVERY_FEE, total: subtotal + DELIVERY_FEE };
    },
    { subtotal: 0, deliveryFee: DELIVERY_FEE, total: DELIVERY_FEE },
  );

  return {
    items,
    totals,
    count: items.reduce((acc, item) => acc + item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
}