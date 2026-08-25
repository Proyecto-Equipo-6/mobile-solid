import { api } from '@/shared/api/client';

import type {
  BackendProducto,
  Category,
  Product,
} from '@/features/catalog/types/catalog.types';
import { mapProductoToProduct } from '@/features/catalog/types/catalog.types';

function extractProductsArray(data: unknown): BackendProducto[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('items' in data && Array.isArray((data as { items: unknown }).items)) {
      return (data as { items: BackendProducto[] }).items;
    }
    if ('productos' in data && Array.isArray((data as { productos: unknown }).productos)) {
      return (data as { productos: BackendProducto[] }).productos;
    }
  }
  return [];
}

export async function listProducts(): Promise<Product[]> {
  const data = await api.get<BackendProducto[] | { items: BackendProducto[] } | { productos: BackendProducto[] }>('/productos/publico');
  const productosList = extractProductsArray(data);

  return productosList.map(mapProductoToProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const data = await api.get<BackendProducto>(`/productos/${id}`);
  return mapProductoToProduct(data);
}

function extractCategoriesArray(data: unknown): { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'categorias' in data && Array.isArray((data as { categorias: unknown }).categorias)) {
    return (data as { categorias: { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] }).categorias;
  }
  return [];
}

export async function listCategories(): Promise<Category[]> {
  const data = await api.get<
    { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] | { categorias: { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] }
  >('/categorias');
  const categoriasList = extractCategoriesArray(data);
  return categoriasList
    .filter((categoria) => Number(categoria.estado) === 1)
    .map((categoria) => ({
      id: String(categoria.id_categoria),
      name: categoria.nombre,
    }));
}