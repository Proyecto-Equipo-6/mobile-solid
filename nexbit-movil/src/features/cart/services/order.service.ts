import { api } from '@/shared/api/client';

import type { CreateOrderPayload, Order } from '@/features/cart/types/cart.types';

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return api.post<Order>('/orders', payload);
}

export async function listMyOrders(): Promise<Order[]> {
  return api.get<Order[]>('/orders');
}

export async function getOrder(id: string): Promise<Order> {
  return api.get<Order>(`/orders/${id}`);
}