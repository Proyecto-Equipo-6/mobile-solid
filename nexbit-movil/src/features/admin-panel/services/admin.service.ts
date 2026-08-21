import { Platform } from 'react-native';
import { api } from '@/shared/api/client';

import type {
  AdminOrder,
  AnalyticsResumen,
  BackendPedidoAdmin,
  BackendRepartidor,
  DriverOption,
  Proveedor,
} from '@/features/admin-panel/types/admin.types';
import {
  mapPedidoAdminToAdminOrder,
  mapRepartidorToDriver,
} from '@/features/admin-panel/types/admin.types';
import type {
  BackendProducto,
  BackendProductoPayload,
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '@/features/catalog/types/catalog.types';
import { mapProductoToProduct } from '@/features/catalog/types/catalog.types';
import type { PickedImage } from '@/shared/utils/imagePicker';

export async function uploadProductImage(imagen: PickedImage): Promise<string> {
  const tipo =
    imagen.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    const byteCharacters = atob(imagen.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: tipo });
    formData.append('fotoEvidencia', blob, `producto-${Date.now()}.jpg`);
  } else {
    formData.append('fotoEvidencia', {
      uri: imagen.uri,
      name: `producto-${Date.now()}.jpg`,
      type: tipo,
    } as unknown as Blob);
  }
  
  console.log('[UPLOAD] Sending image:', { 
    uri: Platform.OS === 'web' ? 'base64 data' : imagen.uri, 
    name: `producto-${Date.now()}.jpg`, 
    type: tipo,
    mimeType: imagen.mimeType
  });
  
  const data = await api.upload<{ imagen_url: string }>('/productos/imagen', formData);
  console.log('[UPLOAD] Response:', data);
  return data.imagen_url;
}

export async function listProducts(): Promise<Product[]> {
  const data = await api.get<BackendProducto[]>('/productos');
  return data.map(mapProductoToProduct);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const body: BackendProductoPayload = {
    sku: payload.sku,
    id_categoria: Number(payload.categoryId),
    id_proveedor: Number(payload.supplierId),
    nombre: payload.name,
    descripcion: payload.description ?? '',
    precio: payload.price,
    stock: payload.stock ?? 0,
    imagen_url: payload.imageUrl ?? null,
    estado: payload.available ? 1 : 0,
  };
  const data = await api.post<BackendProducto>('/productos', body);
  return mapProductoToProduct(data);
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const body: BackendProductoPayload = {
    sku: payload.sku ?? '',
    id_categoria: Number(payload.categoryId ?? 0),
    id_proveedor: Number(payload.supplierId ?? 0),
    nombre: payload.name ?? '',
    descripcion: payload.description,
    precio: payload.price ?? 0,
    stock: payload.stock ?? 0,
    imagen_url: payload.imageUrl ?? null,
    estado: payload.available === undefined ? undefined : payload.available ? 1 : 0,
  };
  const data = await api.put<BackendProducto>(`/productos/${id}`, body);
  return mapProductoToProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(`/productos/${id}`);
}

export async function getAnalyticsSummary(): Promise<AnalyticsResumen> {
  return api.get<AnalyticsResumen>('/analitica/resumen');
}

export async function listProveedores(): Promise<Proveedor[]> {
  const data = await api.get<Proveedor[]>('/proveedores');
  return data.filter((proveedor) => Number(proveedor.estado) === 1);
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const response = await api.get<{
    data: BackendPedidoAdmin[];
    total: number;
    page: number;
    limit: number;
  } | BackendPedidoAdmin[]>('/admin/pedidos');
  console.log('[listAdminOrders] Raw response:', response);
  const ordersArray = Array.isArray(response) ? response : (response.data ?? []);
  return ordersArray.map(mapPedidoAdminToAdminOrder);
}

export async function listDrivers(): Promise<DriverOption[]> {
  const data = await api.get<BackendRepartidor[] | { items: BackendRepartidor[] } | { repartidores: BackendRepartidor[] }>('/admin/repartidores');
  const repartidoresList = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.repartidores)
        ? data.repartidores
        : [];
  console.log('[listDrivers] Raw response:', data);
  console.log('[listDrivers] Extracted list:', repartidoresList);
  return repartidoresList.map(mapRepartidorToDriver);
}

export async function assignOrder(orderId: string, driverId: string): Promise<AdminOrder> {
  const data = await api.put<BackendPedidoAdmin>(`/admin/pedidos/${orderId}/asignar`, {
    id_repartidor: Number(driverId),
  });
  return mapPedidoAdminToAdminOrder(data);
}

export async function updateOrderStatus(orderId: string, estado: string): Promise<AdminOrder> {
  const data = await api.put<BackendPedidoAdmin>(`/admin/pedidos/${orderId}/estado`, { estado });
  return mapPedidoAdminToAdminOrder(data);
}