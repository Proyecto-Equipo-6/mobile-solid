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
  estado: 'DISPONIBLE' | 'INACTIVO' | string;
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