import { api } from '@/shared/api/client';

import type {
  BackendProducto,
  Category,
  Product,
} from '@/features/catalog/types/catalog.types';
import { mapProductoToProduct } from '@/features/catalog/types/catalog.types';

export async function listProducts(): Promise<Product[]> {
  const data = await api.get<BackendProducto[] | { items: BackendProducto[] } | { productos: BackendProducto[] }>('/productos/publico');
  const productosList = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.productos)
        ? data.productos
        : [];
  return productosList.map(mapProductoToProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const data = await api.get<BackendProducto>(`/productos/${id}`);
  return mapProductoToProduct(data);
}

export async function listCategories(): Promise<Category[]> {
  const data = await api.get<
    { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] | { categorias: { id_categoria: number | string; nombre: string; descripcion?: string; estado: number }[] }
  >('/categorias');
  const categoriasList = Array.isArray(data)
    ? data
    : Array.isArray(data?.categorias)
      ? data.categorias
      : [];
  return categoriasList
    .filter((categoria) => Number(categoria.estado) === 1)
    .map((categoria) => ({
      id: String(categoria.id_categoria),
      name: categoria.nombre,
    }));
}