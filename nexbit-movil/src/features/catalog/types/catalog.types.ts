import { resolveImageUrl } from '@/shared/utils/imageUrl';

export type Category = {
  id: string;
  name: string;
};

export type BackendProducto = {
  id_producto: number | string;
  sku: string;
  id_categoria?: number | string;
  id_proveedor?: number | string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  garantia?: string;
  imagen_url?: string | null;
  estado: number;
  categoria?: string;
  proveedor?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl?: string;
  categoryId?: string;
  categoryName?: string;
  available: boolean;
  createdAt: string;
};

export function mapProductoToProduct(producto: BackendProducto): Product {
  return {
    id: String(producto.id_producto),
    name: producto.nombre,
    description: producto.descripcion,
    price: Number(producto.precio),
    stock: Number(producto.stock),
    sku: producto.sku,
    imageUrl: resolveImageUrl(producto.imagen_url),
    categoryId:
      producto.id_categoria !== undefined ? String(producto.id_categoria) : undefined,
    categoryName: producto.categoria,
    available: Number(producto.estado) === 1,
    createdAt: producto.fecha_creacion ?? producto.fecha_actualizacion ?? '',
  };
}

export type BackendProductoPayload = {
  sku: string;
  id_categoria: number;
  id_proveedor: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen_url?: string | null;
  estado?: number;
};

export type CreateProductPayload = {
  name: string;
  description?: string;
  price: number;
  sku: string;
  categoryId: string;
  supplierId: string;
  available: boolean;
  stock?: number;
  imageUrl?: string;
};

export type UpdateProductPayload = Partial<CreateProductPayload>;