import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { CartItem, CartTotals } from '@/features/cart/types/cart.types';

const DELIVERY_FEE = 5000;

type CartContextValue = {
  items: CartItem[];
  totals: CartTotals;
  count: number;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems((current) => {
      const exists = current.some((item) => item.productId === product.productId);
      if (exists) {
        return current.map((item) => {
          if (item.productId !== product.productId) {
            return item;
          }
          const limite = item.stock !== undefined ? item.stock : Number.POSITIVE_INFINITY;
          return { ...item, quantity: Math.min(item.quantity + 1, limite) };
        });
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }
      return current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }
        const limite = item.stock !== undefined ? item.stock : Number.POSITIVE_INFINITY;
        return { ...item, quantity: Math.min(quantity, limite) };
      });
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
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
  }, [items, addItem, removeItem, updateQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}