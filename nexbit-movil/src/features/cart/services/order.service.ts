import { api } from '@/shared/api/client';

import { sincronizarCarrito } from '@/features/cart/services/cart.service';
import type {
  BackendPedido,
  CartItem,
  CreateOrderPayload,
  Order,
} from '@/features/cart/types/cart.types';
import { mapPedidoToOrder } from '@/features/cart/types/cart.types';

export async function createOrder(
  payload: CreateOrderPayload,
  items: CartItem[],
): Promise<Order> {
  await sincronizarCarrito(items);
  const data = await api.post<{ mensaje: string; pedido: BackendPedido }>('/pedidos', {
    direccionEntrega: payload.direccionEntrega,
    observaciones: payload.observaciones ?? '',
    idMetodoPago: payload.idMetodoPago,
  });
  return mapPedidoToOrder(data.pedido);
}

export async function listMyOrders(): Promise<Order[]> {
  const data = await api.get<{ pedidos: BackendPedido[]; vacio: boolean }>('/pedidos');
  return (data.pedidos ?? []).map(mapPedidoToOrder);
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const data = await api.patch<BackendPedido>(`/pedidos/${orderId}/cancel`);
  return mapPedidoToOrder(data);
}