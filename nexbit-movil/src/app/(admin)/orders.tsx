import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { OrderAssigneeModal } from '@/features/admin-panel/components/OrderAssigneeModal';
import { useAdminOrders } from '@/features/admin-panel/hooks/useAdminInventory';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';

export default function OrdersScreen() {
  const { orders, drivers, isLoading, error, assignOrder, reload } = useAdminOrders();
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

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

  async function handleAssign(driverId: string) {
    if (assigningOrderId === null) {
      return;
    }
    setIsAssigning(true);
    try {
      await assignOrder(assigningOrderId, driverId);
    } finally {
      setIsAssigning(false);
      setAssigningOrderId(null);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView type="backgroundElement" style={styles.orderCard}>
            <ThemedView style={styles.orderHeader}>
              <ThemedText type="smallBold">{item.customerName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </ThemedView>
            <ThemedText type="small" themeColor="textSecondary">
              {item.deliveryAddress.address}, {item.deliveryAddress.city}
            </ThemedText>
            <ThemedView style={styles.orderFooter}>
              <ThemedText type="smallBold">{formatCurrency(item.total)}</ThemedText>
              {!item.driverId && (
                <Pressable onPress={() => setAssigningOrderId(item.id)}>
                  <ThemedText type="link">Asignar repartidor</ThemedText>
                </Pressable>
              )}
            </ThemedView>
          </ThemedView>
        )}
      />

      <OrderAssigneeModal
        visible={assigningOrderId !== null}
        drivers={drivers}
        isAssigning={isAssigning}
        onSelect={handleAssign}
        onClose={() => setAssigningOrderId(null)}
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
  },
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  orderCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});