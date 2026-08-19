import type { Order } from '@/features/cart/types/cart.types';

export type DeliveryOrder = Order & {
  customerName: string;
  customerPhone: string;
  cashToCollect: number;
};

export type CashCollection = {
  orderId: string;
  amountCollected: number;
  collectedAt: string;
};