import { api } from '@/shared/api/client';

import type { CartItem } from '@/features/cart/types/cart.types';

export async function verCarrito(): Promise<void> {
  await api.get('/carrito');
}

export async function agregarAlCarrito(productoId: number, cantidad = 1): Promise<void> {
  await api.post('/carrito', { productoId, cantidad });
}

export async function sincronizarCarrito(items: CartItem[]): Promise<void> {
  for (const item of items) {
    await agregarAlCarrito(Number(item.productId), item.quantity);
  }
}