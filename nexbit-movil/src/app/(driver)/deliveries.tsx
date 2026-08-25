import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard';
import { useDriverOrders } from '@/features/delivery/hooks/useDriverOrders';
import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { pickImage } from '@/shared/utils/imagePicker';

const MAX_TAMANO_FOTO = 3 * 1024 * 1024;

export default function DeliveriesScreen() {
  const dash = useDashTheme();
  const { dashboard, isLoading, error, startDelivery, uploadComprobante, deliverOrder, markNotDelivered, reload } = useDriverOrders();
  const [startingOrderId, setStartingOrderId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<'ENTREGADO' | 'NO_ENTREGADO' | null>(null);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [observation, setObservation] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (dashboard?.pedidoActivo) {
      setActiveOrder(dashboard.pedidoActivo);
    } else if (dashboard && !isLoading) {
      setActiveOrder(null);
    }
  }, [dashboard, isLoading]);

  function resetActiveState() {
    setSelectedStatus(null);
    setComprobanteUrl(null);
    setIsUploading(false);
    setObservation('');
    setIsConfirming(false);
  }

  if (isLoading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}>
        <ActivityIndicator color={dash.accent} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}>
        <ThemedText style={styles.errorTexto}>{error}</ThemedText>
        <Pressable onPress={reload}>
          <ThemedText style={styles.enlace}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const queue = (dashboard?.pedidosEnCola ?? []).filter((item) => item.id !== activeOrder?.id);
  const totalDia = dashboard?.conteoDelDia ?? 0;
  const pendientes = queue.length + (activeOrder ? 1 : 0);

  async function handleStart(order: DeliveryOrder) {
    if (startingOrderId !== null) {
      return;
    }
    if (activeOrder && activeOrder.id !== order.id) {
      return;
    }
    setStartingOrderId(order.id);
    try {
      const updated = await startDelivery(order.id);
      if (updated) {
        setActiveOrder(updated);
      } else {
        setActiveOrder({ ...order, status: 'in_transit', estadoRaw: 'EN_CAMINO' });
      }
    } finally {
      setStartingOrderId(null);
    }
  }

  async function handleUploadComprobante() {
    if (!activeOrder || isUploading) return;
    try {
      const seleccionada = await pickImage('camera');
      if (!seleccionada) return;
      if (seleccionada.fileSize > MAX_TAMANO_FOTO) {
        return;
      }
      setIsUploading(true);
      const url = await uploadComprobante(activeOrder.id, seleccionada);
      setComprobanteUrl(url);
    } catch {
      setComprobanteUrl(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirm() {
    if (!activeOrder || isConfirming || isUploading) return;
    if (selectedStatus === 'ENTREGADO' && !comprobanteUrl) return;
    if (selectedStatus === 'NO_ENTREGADO' && observation.trim().length === 0) return;

    setIsConfirming(true);
    try {
      if (selectedStatus === 'ENTREGADO' && comprobanteUrl) {
        await deliverOrder(activeOrder.id, comprobanteUrl);
      } else if (selectedStatus === 'NO_ENTREGADO') {
        await markNotDelivered(activeOrder.id, observation.trim());
      }
      resetActiveState();
      setActiveOrder(null);
      reload();
    } catch {
    } finally {
      setIsConfirming(false);
    }
  }

  function getActiveOrderProps(item: DeliveryOrder) {
    if (item.id !== activeOrder?.id) {
      return {};
    }
    return {
      onStatusSelect: (s: 'ENTREGADO' | 'NO_ENTREGADO') => setSelectedStatus(s),
      selectedStatus,
      onUploadComprobante: handleUploadComprobante,
      isUploading,
      comprobanteUploaded: Boolean(comprobanteUrl),
      observation,
      onObservationChange: setObservation,
      onConfirm: handleConfirm,
      isConfirming,
    };
  }

  function renderDeliveryOrder({ item }: { item: DeliveryOrder }) {
    return (
      <DeliveryOrderCard
        order={item}
        isStarting={startingOrderId === item.id}
        onStart={() => handleStart(item)}
        {...getActiveOrderProps(item)}
      />
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.cabecera}>
        <ThemedText style={styles.titulo}>Entregas de hoy</ThemedText>
        <ThemedText style={styles.subtitulo}>
          {pendientes} en curso de {totalDia} asignados · avanza cada entrega paso a paso.
        </ThemedText>
      </ThemedView>

      <FlatList
        data={activeOrder ? [activeOrder, ...queue] : queue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderDeliveryOrder}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={{ color: dash.textSecondary }}>
              No tienes pedidos asignados por el momento.
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  errorTexto: {
    color: DashColors.textSecondary,
  },
  enlace: {
    color: DashColors.accent,
    fontWeight: '600',
  },
  cabecera: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  titulo: {
    color: DashColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitulo: {
    color: DashColors.textSecondary,
    fontSize: 14,
  },
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
    paddingTop: Spacing.one,
  },
});