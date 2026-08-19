import type { Order } from '@/features/cart/types/cart.types';

export type InventorySummary = {
  totalProducts: number;
  unavailableProducts: number;
};

export type DriverOption = {
  id: string;
  name: string;
  phone?: string;
};

export type OrderAssignment = {
  orderId: string;
  driverId: string;
};

export type AdminOrder = Order & {
  customerName: string;
  customerPhone: string;
};