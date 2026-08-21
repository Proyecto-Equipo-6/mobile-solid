import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { ConfirmDeliveryModal } from '@/features/delivery/components/ConfirmDeliveryModal';
import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard';
import { useDriverOrders } from '@/features/delivery/hooks/useDriverOrders';
import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

export default function DeliveriesScreen() {
  const dash = useDashTheme();
  const { dashboard, isLoading, error, startDelivery, reload } = useDriverOrders();
  const [startingOrderId, setStartingOrderId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    if (startingOrderId !== null || activeOrder) {
      return;
    }
    setStartingOrderId(order.id);
    try {
      await startDelivery(order.id);
      setActiveOrder({ ...order, status: 'in_transit', estadoRaw: 'EN_CAMINO' });
    } finally {
      setStartingOrderId(null);
    }
  }

  function handleDone() {
    setModalVisible(false);
    setActiveOrder(null);
    reload();
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
        renderItem={({ item }) => {
          const isActive = item.id === activeOrder?.id;
          return (
            <DeliveryOrderCard
              order={item}
              isStarting={!isActive && startingOrderId === item.id}
              onStart={isActive ? undefined : () => handleStart(item)}
              onConfirm={isActive ? () => setModalVisible(true) : undefined}
              onNotDelivered={isActive ? () => setModalVisible(true) : undefined}
            />
          );
        }}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText style={{ color: dash.textSecondary }}>
              No tienes pedidos asignados por el momento.
            </ThemedText>
          </ThemedView>
        }
      />

      <ConfirmDeliveryModal
        visible={modalVisible}
        order={activeOrder}
        onClose={() => setModalVisible(false)}
        onDone={handleDone}
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