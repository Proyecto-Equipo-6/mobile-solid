export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'not_delivered'
  | 'cancelled';

export const ESTADO_ORDEN_A_INTERNO: Record<string, OrderStatus> = {
  PENDIENTE: 'pending',
  CONFIRMADO: 'confirmed',
  ASIGNADO: 'assigned',
  EN_CAMINO: 'in_transit',
  ENTREGADO: 'delivered',
  NO_ENTREGADO: 'not_delivered',
  CANCELADO: 'cancelled',
};

export type BackendPedido = {
  id_pedido: number | string;
  id_metodo_pago?: number | string;
  direccion_entrega?: string;
  total: number | string;
  estado: string;
  observaciones?: string;
  fecha_pedido: string;
  fecha_actualizacion?: string;
};

export type Order = {
  id: string;
  total: number;
  status: OrderStatus;
  estadoRaw: string;
  createdAt: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  notes?: string;
};

export function mapPedidoToOrder(pedido: BackendPedido): Order {
  return {
    id: String(pedido.id_pedido),
    total: Number(pedido.total),
    status: ESTADO_ORDEN_A_INTERNO[pedido.estado] ?? 'pending',
    estadoRaw: pedido.estado,
    createdAt: pedido.fecha_pedido ?? pedido.fecha_actualizacion ?? '',
    deliveryAddress: pedido.direccion_entrega,
    paymentMethod: pedido.id_metodo_pago !== undefined ? String(pedido.id_metodo_pago) : undefined,
    notes: pedido.observaciones,
  };
}

export type CreateOrderPayload = {
  direccionEntrega: string;
  observaciones?: string;
  idMetodoPago: number;
};

export type CartTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};