import { useCallback, useEffect, useState } from 'react';

import * as deliveryService from '@/features/delivery/services/delivery.service';
import type { DriverDashboard } from '@/features/delivery/types/delivery.types';
import type { PickedImage } from '@/shared/utils/imagePicker';

export function useDriverOrders() {
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await deliveryService.getDashboard();
        if (!cancelled) {
          setDashboard(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar las entregas');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const startDelivery = useCallback(async (orderId: string) => {
    await deliveryService.updateDeliveryStatus(orderId, 'EN_CAMINO', 'ASIGNADO');
    setReloadKey((key) => key + 1);
  }, []);

  const uploadComprobante = useCallback(async (orderId: string, imagen: PickedImage): Promise<string> => {
    return await deliveryService.subirComprobante(orderId, imagen);
  }, []);

  const deliverOrder = useCallback(async (orderId: string, comprobanteUrl: string) => {
    await deliveryService.entregarPedido(orderId, comprobanteUrl);
    setReloadKey((key) => key + 1);
  }, []);

  const markNotDelivered = useCallback(async (orderId: string, observacion: string) => {
    await deliveryService.marcarNoEntregado(orderId, observacion);
    setReloadKey((key) => key + 1);
  }, []);

  return {
    dashboard,
    isLoading,
    error,
    startDelivery,
    uploadComprobante,
    deliverOrder,
    markNotDelivered,
    reload,
  };
}
