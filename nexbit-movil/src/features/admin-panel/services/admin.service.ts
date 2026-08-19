import { api } from '@/shared/api/client';

import type {
  AdminOrder,
  DriverOption,
  InventorySummary,
  OrderAssignment,
} from '@/features/admin-panel/types/admin.types';
import type { CreateProductPayload, Product, UpdateProductPayload } from '@/features/catalog/types/catalog.types';

export async function listProducts(): Promise<Product[]> {
  return api.get<Product[]>('/admin/products');
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return api.post<Product>('/admin/products', payload);
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  return api.patch<Product>(`/admin/products/${id}`, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(`/admin/products/${id}`);
}

export async function getInventorySummary(): Promise<InventorySummary> {
  return api.get<InventorySummary>('/admin/inventory/summary');
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  return api.get<AdminOrder[]>('/admin/orders');
}

export async function listDrivers(): Promise<DriverOption[]> {
  return api.get<DriverOption[]>('/admin/drivers');
}

export async function assignOrder(payload: OrderAssignment): Promise<AdminOrder> {
  return api.post<AdminOrder>('/admin/orders/assign', payload);
}