import { useCallback, useEffect, useState } from 'react';

import * as deliveryService from '@/features/delivery/services/delivery.service';
import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';

export function useDriverOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await deliveryService.listDriverOrders();
        if (!cancelled) {
          setOrders(data);
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

  const acceptOrder = useCallback(async (orderId: string) => {
    const updated = await deliveryService.acceptDelivery(orderId);
    setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
  }, []);

  const collectOrder = useCallback(
    async (orderId: string, amountCollected: number) => {
      const updated = await deliveryService.registerCashCollection({
        orderId,
        amountCollected,
        collectedAt: new Date().toISOString(),
      });
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
    },
    [],
  );

  return { orders, isLoading, error, acceptOrder, collectOrder, reload };
}