import { StyleSheet } from 'react-native';

import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';
import { Button } from '@/shared/components/button';
import { Pill, STATUS_COLORS, STATUS_LABELS } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';

type DeliveryOrderCardProps = {
  order: DeliveryOrder;
  isStarting?: boolean;
  onStart?: () => void;
  onConfirm?: () => void;
  onNotDelivered?: () => void;
};

export function DeliveryOrderCard({
  order,
  isStarting,
  onStart,
  onConfirm,
  onNotDelivered,
}: DeliveryOrderCardProps) {
  const dash = useDashTheme();
  const isAssigned = order.status === 'assigned';
  const isInTransit = order.status === 'in_transit';

  return (
    <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerInfo}>
          <ThemedText type="smallBold" style={{ color: dash.text }}>
            {order.customerName}
          </ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            {formatDateTime(order.createdAt)}
          </ThemedText>
        </ThemedView>
        <Pill
          label={STATUS_LABELS[order.status] ?? order.status}
          color={STATUS_COLORS[order.status]}
        />
      </ThemedView>

      <ThemedText type="small" style={{ color: dash.textSecondary }}>
        {order.address}
      </ThemedText>
      {order.customerPhone ? (
        <ThemedText type="small" style={{ color: dash.textSecondary }}>
          {order.customerPhone}
        </ThemedText>
      ) : null}

      <ThemedView style={styles.footer}>
        <ThemedView style={styles.recaudo}>
          <ThemedText type="small" style={{ color: dash.textMuted }}>
            Total a cobrar
          </ThemedText>
          <ThemedText type="smallBold" style={{ color: dash.text }}>
            {formatCurrency(order.total)}
          </ThemedText>
        </ThemedView>

        {isAssigned && onStart ? (
          <Button label={isStarting ? 'Iniciando…' : 'Iniciar entrega'} pill loading={isStarting} onPress={onStart} />
        ) : null}

        {isInTransit ? (
          <ThemedView style={styles.acciones}>
            <Button label="No entregado" variant="secondary" pill onPress={onNotDelivered} />
            <Button label="Confirmar entrega" pill onPress={onConfirm} />
          </ThemedView>
        ) : null}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  recaudo: {
    gap: Spacing.half,
  },
  acciones: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});