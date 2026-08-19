import { api } from '@/shared/api/client';

import type { CashCollection, DeliveryOrder } from '@/features/delivery/types/delivery.types';

export async function listDriverOrders(): Promise<DeliveryOrder[]> {
  return api.get<DeliveryOrder[]>('/driver/orders');
}

export async function acceptDelivery(orderId: string): Promise<DeliveryOrder> {
  return api.post<DeliveryOrder>(`/driver/orders/${orderId}/accept`);
}

export async function registerCashCollection(payload: CashCollection): Promise<DeliveryOrder> {
  return api.post<DeliveryOrder>('/driver/collections', payload);
}