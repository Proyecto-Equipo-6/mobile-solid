import { Pressable, StyleSheet } from 'react-native';

import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';

type DeliveryOrderCardProps = {
  order: DeliveryOrder;
  onAccept: () => void;
  onCollect: () => void;
};

export function DeliveryOrderCard({ order, onAccept, onCollect }: DeliveryOrderCardProps) {
  const isPending = order.status === 'assigned';
  const isInTransit = order.status === 'in_transit';

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">{order.customerName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDateTime(order.createdAt)}
        </ThemedText>
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        {order.deliveryAddress.address}, {order.deliveryAddress.city}
      </ThemedText>

      <ThemedView style={styles.footer}>
        <ThemedText type="smallBold">Recaudo: {formatCurrency(order.cashToCollect)}</ThemedText>

        {isPending && (
          <Pressable onPress={onAccept} style={styles.button}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              Aceptar entrega
            </ThemedText>
          </Pressable>
        )}

        {isInTransit && (
          <Pressable onPress={onCollect} style={styles.button}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              Registrar recaudo
            </ThemedText>
          </Pressable>
        )}

        {order.status === 'delivered' && (
          <ThemedText type="small" themeColor="textSecondary">
            Entregado
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  buttonText: {
    color: '#ffffff',
  },
});