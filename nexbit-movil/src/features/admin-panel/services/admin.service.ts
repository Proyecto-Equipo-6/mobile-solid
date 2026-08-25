import { Platform } from 'react-native';
import { api } from '@/shared/api/client';

import type {
  AdminOrder,
  AnalyticsResumen,
  BackendPedidoAdmin,
  BackendRepartidor,
  BackendUsuarioAdmin,
  BackendCategoria,
  BackendProveedorAdmin,
  BackendRepartidorAdmin,
  BackendRol,
  CategoriaAdmin,
  CreateUserPayload,
  DriverOption,
  Proveedor,
  RepartidorAdmin,
  RolAdmin,
  UpdateUserPayload,
  UsuarioAdmin,
} from '@/features/admin-panel/types/admin.types';
import {
  mapPedidoAdminToAdminOrder,
  mapRepartidorToDriver,
  mapUsuarioAdminToFrontend,
  mapCategoriaToFrontend,
  mapProveedorToFrontend,
  mapRepartidorAdminToFrontend,
  mapRolToFrontend,
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
      byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
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
  let estado: number | undefined;
  if (payload.available !== undefined) {
    estado = payload.available ? 1 : 0;
  }

  const body: BackendProductoPayload = {
    sku: payload.sku ?? '',
    id_categoria: Number(payload.categoryId ?? 0),
    id_proveedor: Number(payload.supplierId ?? 0),
    nombre: payload.name ?? '',
    descripcion: payload.description,
    precio: payload.price ?? 0,
    stock: payload.stock ?? 0,
    imagen_url: payload.imageUrl ?? null,
    estado,
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

function extractArrayFromResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if ('items' in data && Array.isArray((data as { items: unknown }).items)) {
      return (data as { items: T[] }).items;
    }
    if ('repartidores' in data && Array.isArray((data as { repartidores: unknown }).repartidores)) {
      return (data as { repartidores: T[] }).repartidores;
    }
  }
  return [];
}

export async function listDrivers(): Promise<DriverOption[]> {
  const data = await api.get<BackendRepartidor[] | { items: BackendRepartidor[] } | { repartidores: BackendRepartidor[] }>('/admin/repartidores');
  const repartidoresList = extractArrayFromResponse<BackendRepartidor>(data);

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

export async function deliverOrderWithEvidence(orderId: string, imagen: PickedImage, observacion?: string): Promise<AdminOrder> {
  const tipo = imagen.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    const byteCharacters = atob(imagen.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.codePointAt(i) ?? 0;
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: tipo });
    formData.append('fotoEvidencia', blob, `entrega-${Date.now()}.jpg`);
  } else {
    formData.append('fotoEvidencia', {
      uri: imagen.uri,
      name: `entrega-${Date.now()}.jpg`,
      type: tipo,
    } as unknown as Blob);
  }
  
  if (observacion) {
    formData.append('observacion', observacion);
  }
  
  console.log('[deliverOrderWithEvidence] Sending image:', { 
    uri: Platform.OS === 'web' ? 'base64 data' : imagen.uri, 
    name: `entrega-${Date.now()}.jpg`, 
    type: tipo,
    mimeType: imagen.mimeType,
    observacion
  });
  
  const data = await api.upload<BackendPedidoAdmin>(`/admin/pedidos/${orderId}/entregar`, formData);
  console.log('[deliverOrderWithEvidence] Response:', data);
  return mapPedidoAdminToAdminOrder(data);
}

// === USUARIOS ===
export async function listUsers(): Promise<UsuarioAdmin[]> {
  const data = await api.get<BackendUsuarioAdmin[] | { data: BackendUsuarioAdmin[] }>('/admin/usuarios');
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  return list.map(mapUsuarioAdminToFrontend);
}

export async function listRolesForDropdown(): Promise<{ id: string; name: string }[]> {
  const data = await api.get<BackendRol[]>('/roles');
  return data.map((r) => ({ id: String(r.id), name: r.name }));
}

export async function createUser(payload: CreateUserPayload): Promise<UsuarioAdmin> {
  const data = await api.post<{ usuario: BackendUsuarioAdmin }>('/admin/usuarios', payload);
  return mapUsuarioAdminToFrontend(data.usuario);
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UsuarioAdmin> {
  const data = await api.put<{ usuario: BackendUsuarioAdmin }>(`/admin/usuarios/${id}`, payload);
  return mapUsuarioAdminToFrontend(data.usuario);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete<void>(`/admin/usuarios/${id}`);
}

// === CATEGORÍAS ===
export async function listAllCategories(): Promise<CategoriaAdmin[]> {
  const data = await api.get<BackendCategoria[]>('/categorias/todas');
  return data.map(mapCategoriaToFrontend);
}

export async function createCategory(payload: { nombre: string; descripcion: string; estado: string }): Promise<CategoriaAdmin> {
  const data = await api.post<BackendCategoria>('/categorias', payload);
  return mapCategoriaToFrontend(data);
}

export async function updateCategory(id: string, payload: { nombre: string; descripcion: string; estado: string }): Promise<CategoriaAdmin> {
  const data = await api.put<BackendCategoria>(`/categorias/${id}`, payload);
  return mapCategoriaToFrontend(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete<void>(`/categorias/${id}`);
}

// === PROVEEDORES ===
export async function listAllSuppliers(): Promise<ProveedorAdmin[]> {
  const data = await api.get<BackendProveedorAdmin[]>('/proveedores/todos');
  return data.map(mapProveedorToFrontend);
}

export async function createSupplier(payload: { nit_proveedor: string; razon_social: string; telefono: string; email: string }): Promise<ProveedorAdmin> {
  const data = await api.post<BackendProveedorAdmin>('/proveedores', payload);
  return mapProveedorToFrontend(data);
}

export async function updateSupplier(id: string, payload: { nit_proveedor: string; razon_social: string; telefono: string; email: string; estado?: number }): Promise<ProveedorAdmin> {
  const data = await api.put<BackendProveedorAdmin>(`/proveedores/${id}`, payload);
  return mapProveedorToFrontend(data);
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete<void>(`/proveedores/${id}`);
}

// === REPARTIDORES (ADMIN) ===
export async function listDriversAdmin(): Promise<RepartidorAdmin[]> {
  const data = await api.get<BackendRepartidorAdmin[] | { data: BackendRepartidorAdmin[] }>('/admin/repartidores');
  const list = Array.isArray(data) ? data : (data?.data ?? []);
  return list.map(mapRepartidorAdminToFrontend);
}

export async function createDriver(payload: { nombre_apellido: string; email: string; password: string; telefono: string; vehiculo?: string; placa?: string; direccion?: string }): Promise<void> {
  await api.post('/admin/repartidores', payload);
}

export async function updateDriver(id: string, payload: { nombre_apellido?: string; email?: string; telefono?: string; vehiculo?: string; placa?: string; direccion?: string }): Promise<void> {
  await api.put(`/admin/repartidores/${id}`, payload);
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete<void>(`/admin/repartidores/${id}`);
}

// === ROLES ===
export async function listRoles(): Promise<RolAdmin[]> {
  const data = await api.get<BackendRol[]>('/roles');
  return data.map(mapRolToFrontend);
}

export async function createRole(payload: { name: string; description: string }): Promise<RolAdmin> {
  const data = await api.post<BackendRol>('/roles', payload);
  return mapRolToFrontend(data);
}

export async function updateRole(id: string, payload: { name: string; description: string }): Promise<RolAdmin> {
  const data = await api.put<BackendRol>('/roles', { id: Number(id), ...payload });
  return mapRolToFrontend(data);
}