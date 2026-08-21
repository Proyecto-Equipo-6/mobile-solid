import { ESTADO_ORDEN_A_INTERNO, type OrderStatus } from '@/features/cart/types/cart.types';

export type BackendPedidoRepartidor = {
  id_pedido: number | string;
  id_usuario?: number | string;
  id_repartidor?: number | string | null;
  id_metodo_pago?: number | string;
  direccion_entrega: string;
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

export type DeliveryOrder = {
  id: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  total: number;
  status: OrderStatus;
  estadoRaw: string;
  createdAt: string;
};

export function mapPedidoRepartidorToDeliveryOrder(
  pedido: BackendPedidoRepartidor,
): DeliveryOrder {
  return {
    id: String(pedido.id_pedido),
    customerName: pedido.clienteNombre ?? '',
    customerPhone: pedido.clienteTelefono,
    address: pedido.direccion_entrega,
    total: Number(pedido.total),
    status: ESTADO_ORDEN_A_INTERNO[pedido.estado] ?? 'assigned',
    estadoRaw: pedido.estado,
    createdAt: pedido.fecha_pedido ?? pedido.fecha_actualizacion ?? '',
  };
}

export type DriverDashboard = {
  conteoDelDia: number;
  pedidoActivo: DeliveryOrder | null;
  pedidosEnCola: DeliveryOrder[];
  mensaje?: string;
};