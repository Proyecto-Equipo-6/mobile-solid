import { ESTADO_ORDEN_A_INTERNO, type OrderStatus } from '@/features/cart/types/cart.types';

export type BackendRepartidor = {
  id_repartidor: number | string;
  id_usuario: number | string;
  activo: number;
  vehiculo?: string;
  placa?: string;
  nombre: string;
  apellidos?: string;
  nombre_apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: string;
};

export type DriverOption = {
  id: string;
  name: string;
  phone?: string;
  available: boolean;
};

export function mapRepartidorToDriver(repartidor: BackendRepartidor): DriverOption {
  const id = String(repartidor.id_repartidor ?? repartidor.id_usuario ?? repartidor.id);
  const name = repartidor.nombre_apellido ?? repartidor.nombre ?? repartidor.nombre_completo ?? repartidor.name ?? 'Sin Nombre';

  return {
    id,
    name,
    phone: repartidor.telefono,
    available: true,
  };
}

export type BackendPedidoAdmin = {
  id_pedido: number | string;
  id_usuario?: number | string;
  id_repartidor?: number | string | null;
  id_metodo_pago?: number | string;
  direccion_entrega?: string;
  total: number | string;
  estado: string;
  comprobante_url?: string | null;
  observaciones?: string | null;
  motivo_cancelacion?: string | null;
  fecha_pedido: string;
  fecha_actualizacion?: string;
  clienteNombre?: string;
  clienteTelefono?: string;
  caracteristicasLogistica?: string;
};

export type AdminOrder = {
  id: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  total: number;
  status: OrderStatus;
  estadoRaw: string;
  createdAt: string;
  driverId?: string;
  comprobanteUrl?: string | null;
};

export function mapPedidoAdminToAdminOrder(pedido: BackendPedidoAdmin): AdminOrder {
  return {
    id: String(pedido.id_pedido),
    customerName: pedido.clienteNombre ?? '',
    customerPhone: pedido.clienteTelefono,
    address: pedido.direccion_entrega,
    total: Number(pedido.total),
    status: ESTADO_ORDEN_A_INTERNO[pedido.estado] ?? 'pending',
    estadoRaw: pedido.estado,
    createdAt: pedido.fecha_pedido ?? pedido.fecha_actualizacion ?? '',
    driverId:
      pedido.id_repartidor !== undefined && pedido.id_repartidor !== null
        ? String(pedido.id_repartidor)
        : undefined,
    comprobanteUrl: pedido.comprobante_url ?? null,
  };
}

export type Proveedor = {
  id_proveedor: number | string;
  razon_social: string;
  nit_proveedor?: string;
  telefono?: string;
  email?: string;
  estado: number;
};

export type AnalyticsKpi = {
  id: string;
  titulo: string;
  valor: number;
  delta: number;
  subtitulo: string;
  tipo: string;
  serie: number[];
};

export type AnalyticsResumen = {
  kpis: AnalyticsKpi[];
  ventasPorMes: { mes: string; rotulo: string; ventas: number; pedidos: number }[];
  pedidosPorEstado: { estado: string; cantidad: number; total: number }[];
  productosMasVendidos: {
    id_producto: number;
    nombre: string;
    sku: string;
    categoria: string;
    unidades: number;
    ventas: number;
  }[];
  topClientes: {
    id_usuario: number;
    nombre_apellido: string;
    email: string;
    pedidos: number;
    total_gastado: number;
  }[];
};

export type InventorySummary = {
  totalProducts: number;
  unavailableProducts: number;
  totalOrders: number;
  totalSales: number;
};

// === USUARIOS ===
export type BackendUsuarioAdmin = {
  id_usuario: number | string;
  id_rol: number | string;
  nombre_apellido: string;
  tipo_documento?: string;
  numero_documento?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: number | string;
};

export type UsuarioAdmin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roleId: string;
  documentType: string;
  documentNumber: string;
  address: string;
  active: boolean;
};

export function mapUsuarioAdminToFrontend(u: BackendUsuarioAdmin): UsuarioAdmin {
  return {
    id: String(u.id_usuario),
    name: u.nombre_apellido ?? '',
    email: u.email ?? '',
    phone: u.telefono ?? '',
    roleId: String(u.id_rol),
    documentType: u.tipo_documento ?? 'CC',
    documentNumber: u.numero_documento ?? '',
    address: u.direccion ?? '',
    active: Number(u.activo) === 1,
  };
}

export type CreateUserPayload = {
  id_rol: number;
  nombre_apellido: string;
  email: string;
  password: string;
  telefono: string;
  tipo_documento?: string;
  numero_documento?: string;
  direccion?: string;
};

export type UpdateUserPayload = {
  id_rol?: number;
  nombre_apellido?: string;
  email?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  direccion?: string;
};

// === CATEGORÍAS ===
export type BackendCategoria = {
  id_categoria: number | string;
  nombre: string;
  descripcion: string;
  estado: number | string;
};

export type CategoriaAdmin = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export function mapCategoriaToFrontend(c: BackendCategoria): CategoriaAdmin {
  return {
    id: String(c.id_categoria),
    name: c.nombre ?? '',
    description: c.descripcion ?? '',
    active: Number(c.estado) === 1,
  };
}

// === PROVEEDORES ===
export type BackendProveedorAdmin = {
  id_proveedor: number | string;
  nit_proveedor: string;
  razon_social: string;
  telefono: string;
  email: string;
  imagen_url?: string | null;
  estado: number | string;
};

export type ProveedorAdmin = {
  id: string;
  name: string;
  nit: string;
  email: string;
  phone: string;
  imageUrl: string | null;
  active: boolean;
};

export function mapProveedorToFrontend(p: BackendProveedorAdmin): ProveedorAdmin {
  return {
    id: String(p.id_proveedor),
    name: p.razon_social ?? '',
    nit: p.nit_proveedor ?? '',
    email: p.email ?? '',
    phone: p.telefono ?? '',
    imageUrl: p.imagen_url ?? null,
    active: Number(p.estado) === 1,
  };
}

// === REPARTIDORES (ADMIN) ===
export type BackendRepartidorAdmin = {
  id_repartidor: number | string;
  nombre: string;
  telefono?: string;
  email?: string;
  estado: string;
  pedidos_hoy?: number | string;
  pedidos_semana?: number | string;
  pedidos_mes?: number | string;
};

export type RepartidorAdmin = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'DISPONIBLE' | 'OCUPADO' | 'INACTIVO';
  deliveriesToday: number;
  deliveriesWeek: number;
  deliveriesMonth: number;
};

export function mapRepartidorAdminToFrontend(r: BackendRepartidorAdmin): RepartidorAdmin {
  return {
    id: String(r.id_repartidor),
    name: r.nombre ?? '',
    email: r.email ?? '',
    phone: r.telefono ?? '',
    status: (r.estado as RepartidorAdmin['status']) ?? 'INACTIVO',
    deliveriesToday: Number(r.pedidos_hoy ?? 0),
    deliveriesWeek: Number(r.pedidos_semana ?? 0),
    deliveriesMonth: Number(r.pedidos_mes ?? 0),
  };
}

// === ROLES ===
export type BackendRol = {
  id: number | string;
  name: string;
  description: string;
};

export type RolAdmin = {
  id: string;
  name: string;
  description: string;
};

export function mapRolToFrontend(r: BackendRol): RolAdmin {
  return {
    id: String(r.id),
    name: r.name ?? '',
    description: r.description ?? '',
  };
}