import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { CashCollectModal } from '@/features/delivery/components/CashCollectModal';
import { DeliveryOrderCard } from '@/features/delivery/components/DeliveryOrderCard';
import { useDriverOrders } from '@/features/delivery/hooks/useDriverOrders';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export default function DeliveriesScreen() {
  const { orders, isLoading, error, acceptOrder, collectOrder, reload } = useDriverOrders();
  const [collectingOrderId, setCollectingOrderId] = useState<string | null>(null);
  const [collectingTotal, setCollectingTotal] = useState(0);
  const [isCollecting, setIsCollecting] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable onPress={reload}>
          <ThemedText type="link">Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  function openCollectModal(orderId: string, cashToCollect: number) {
    setCollectingOrderId(orderId);
    setCollectingTotal(cashToCollect);
  }

  async function handleCollect(amountCollected: number) {
    if (collectingOrderId === null) {
      return;
    }
    setIsCollecting(true);
    try {
      await collectOrder(collectingOrderId, amountCollected);
    } finally {
      setIsCollecting(false);
      setCollectingOrderId(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DeliveryOrderCard
            order={item}
            onAccept={() => acceptOrder(item.id)}
            onCollect={() => openCollectModal(item.id, item.cashToCollect)}
          />
        )}
        ListEmptyComponent={
          <ThemedView style={styles.centered}>
            <ThemedText themeColor="textSecondary">No hay entregas pendientes.</ThemedText>
          </ThemedView>
        }
      />

      <CashCollectModal
        visible={collectingOrderId !== null}
        orderTotal={collectingTotal}
        isSubmitting={isCollecting}
        onConfirm={handleCollect}
        onClose={() => setCollectingOrderId(null)}
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
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
});