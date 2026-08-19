import { api } from '@/shared/api/client';

import type { Category, Product } from '@/features/catalog/types/catalog.types';

export async function listProducts(categoryId?: string): Promise<Product[]> {
  return api.get<Product[]>('/products', { categoryId });
}

export async function getProduct(id: string): Promise<Product> {
  return api.get<Product>(`/products/${id}`);
}

export async function listCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories');
}