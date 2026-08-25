import { Platform } from 'react-native';
import { api } from '@/shared/api/client';
import type { PickedImage } from '@/shared/utils/imagePicker';

import type {
  BackendPedidoRepartidor,
  DeliveryOrder,
  DriverDashboard,
} from '@/features/delivery/types/delivery.types';
import { mapPedidoRepartidorToDeliveryOrder } from '@/features/delivery/types/delivery.types';

type DashboardResponse = {
  conteoDelDia: number;
  pedidoActivo: BackendPedidoRepartidor | null;
  pedidosEnCola: BackendPedidoRepartidor[];
  mensaje?: string;
};

export type FotoEntrega = {
  formato: 'jpg' | 'jpeg' | 'png';
  tamano: number;
  url: string;
};

export async function getDashboard(): Promise<DriverDashboard> {
  const response = await api.get<DashboardResponse | { data: DashboardResponse }>('/repartidor/dashboard');
  console.log('[getDashboard] Raw response:', response);
  const data = (response as { data?: DashboardResponse }).data ?? (response as DashboardResponse);
  console.log('[getDashboard] Extracted data:', data);
  return {
    conteoDelDia: data.conteoDelDia ?? 0,
    pedidoActivo: data.pedidoActivo
      ? mapPedidoRepartidorToDeliveryOrder(data.pedidoActivo)
      : null,
    pedidosEnCola: (data.pedidosEnCola ?? []).map(mapPedidoRepartidorToDeliveryOrder),
    mensaje: data.mensaje,
  };
}

export async function getOrderDetail(orderId: string): Promise<DeliveryOrder> {
  const data = await api.get<BackendPedidoRepartidor>(`/repartidor/pedidos/${orderId}/detalle`);
  return mapPedidoRepartidorToDeliveryOrder(data);
}

export async function updateDeliveryStatus(
  orderId: string,
  estado: string,
  estadoAnterior: string,
  extras: { foto?: unknown; observacion?: string; comprobante_url?: string } = {},
): Promise<DeliveryOrder> {
  const data = await api.patch<BackendPedidoRepartidor>(`/repartidor/pedidos/${orderId}/estado`, {
    estado,
    estadoAnterior,
    foto: extras.foto ?? null,
    observacion: extras.observacion ?? null,
    comprobante_url: extras.comprobante_url ?? null,
  });
  return mapPedidoRepartidorToDeliveryOrder(data);
}

export async function subirComprobante(orderId: string, imagen: PickedImage): Promise<string> {
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
    formData.append('foto', blob, `comprobante-${orderId}.jpg`);
  } else {
    const fileObj = {
      uri: imagen.uri,
      name: `comprobante-${orderId}.jpg`,
      type: tipo,
    } as unknown as Blob;
    formData.append('foto', fileObj);
  }

  const response = await api.upload<{ comprobante_url?: string; url?: string; imagen_url?: string; mensaje?: string }>(
    `/repartidor/pedidos/${orderId}/comprobante`,
    formData,
  );
  return response.comprobante_url ?? response.url ?? response.imagen_url ?? '';
}

export async function entregarPedido(orderId: string, comprobanteUrl: string): Promise<DeliveryOrder> {
  return updateDeliveryStatus(orderId, 'ENTREGADO', 'EN_CAMINO', { comprobante_url: comprobanteUrl });
}

export async function marcarNoEntregado(
  orderId: string,
  observacion: string,
): Promise<DeliveryOrder> {
  return updateDeliveryStatus(orderId, 'NO_ENTREGADO', 'EN_CAMINO', { observacion });
}
