import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

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
  onStatusSelect?: (status: 'ENTREGADO' | 'NO_ENTREGADO') => void;
  selectedStatus?: 'ENTREGADO' | 'NO_ENTREGADO' | null;
  onUploadComprobante?: () => void;
  isUploading?: boolean;
  comprobanteUploaded?: boolean;
  observation?: string;
  onObservationChange?: (text: string) => void;
  onConfirm?: () => void;
  isConfirming?: boolean;
};

export function DeliveryOrderCard({
  order,
  isStarting,
  onStart,
  onStatusSelect,
  selectedStatus,
  onUploadComprobante,
  isUploading,
  comprobanteUploaded,
  observation,
  onObservationChange,
  onConfirm,
  isConfirming,
}: DeliveryOrderCardProps) {
  const dash = useDashTheme();
  const isAssigned = order.status === 'assigned';
  const isInTransit = order.status === 'in_transit';
  const isPendingAction = isAssigned || isInTransit;

  const inputStyle = [
    styles.input,
    { color: dash.text, backgroundColor: dash.cardHover, borderColor: dash.border },
  ];

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

      {order.products && order.products.length > 0 ? (
        <ThemedView style={styles.productsSection}>
          <ThemedText type="smallBold" style={{ color: dash.text }}>
            Productos:
          </ThemedText>
          {order.products.map((product) => (
            <ThemedView key={product.id} style={styles.productRow}>
              <ThemedText type="small" style={[styles.productName, { color: dash.textSecondary }]}>
                {product.quantity}x {product.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>
                {formatCurrency(product.subtotal)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : null}

      <ThemedView style={styles.recaudo}>
        <ThemedText type="small" style={{ color: dash.textMuted }}>
          Total a cobrar
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: dash.text }}>
          {formatCurrency(order.total)}
        </ThemedText>
      </ThemedView>

      {isAssigned && onStart && !onStatusSelect ? (
        <ThemedView style={styles.footerFull}>
          <Button label={isStarting ? 'Iniciando…' : 'Iniciar entrega'} pill loading={isStarting} onPress={onStart} />
        </ThemedView>
      ) : null}

      {isPendingAction && onStatusSelect ? (
        <ThemedView style={styles.statusSection}>
          {isAssigned && onStart ? (
            <ThemedView style={styles.startRow}>
              <Button
                label={isStarting ? 'Iniciando…' : 'Iniciar entrega'}
                pill
                loading={isStarting}
                onPress={onStart}
              />
            </ThemedView>
          ) : null}

          <ThemedText type="smallBold" style={{ color: dash.text }}>
            Estado del pedido:
          </ThemedText>

          <ThemedView style={styles.statusRow}>
            <Pressable onPress={() => onStatusSelect('ENTREGADO')}>
              <ThemedView
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: selectedStatus === 'ENTREGADO' ? '#16a34a' : dash.cardHover,
                    borderColor: selectedStatus === 'ENTREGADO' ? '#16a34a' : dash.border,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selectedStatus === 'ENTREGADO' ? '#ffffff' : dash.textSecondary }}>
                  Entregado
                </ThemedText>
              </ThemedView>
            </Pressable>

            <Pressable onPress={() => onStatusSelect('NO_ENTREGADO')}>
              <ThemedView
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: selectedStatus === 'NO_ENTREGADO' ? '#dc2626' : dash.cardHover,
                    borderColor: selectedStatus === 'NO_ENTREGADO' ? '#dc2626' : dash.border,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selectedStatus === 'NO_ENTREGADO' ? '#ffffff' : dash.textSecondary }}>
                  No entregado
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          {selectedStatus === 'ENTREGADO' ? (
            <ThemedView style={styles.comprobanteSection}>
              <Button
                label={isUploading ? 'Subiendo…' : comprobanteUploaded ? 'Comprobante subido ✓' : 'Subir comprobante'}
                variant={comprobanteUploaded ? 'secondary' : 'primary'}
                pill
                loading={isUploading}
                disabled={isUploading || comprobanteUploaded}
                onPress={onUploadComprobante}
              />
            </ThemedView>
          ) : null}

          {selectedStatus === 'NO_ENTREGADO' ? (
            <TextInput
              value={observation}
              onChangeText={onObservationChange}
              placeholder="Motivo de no entrega (obligatorio)..."
              placeholderTextColor={dash.textMuted}
              style={[inputStyle, styles.textarea]}
              multiline
            />
          ) : null}

          {selectedStatus ? (
            <ThemedView style={styles.confirmRow}>
              <Button
                label={isConfirming ? 'Confirmando…' : 'Confirmar'}
                pill
                loading={isConfirming}
                disabled={isConfirming || isUploading}
                onPress={onConfirm}
                style={{
                  backgroundColor: selectedStatus === 'NO_ENTREGADO' ? '#7f1d1d' : dash.accent,
                }}
              />
            </ThemedView>
          ) : null}
        </ThemedView>
      ) : null}
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
  footerFull: {
    marginTop: Spacing.one,
  },
  recaudo: {
    gap: Spacing.half,
  },
  productsSection: {
    gap: Spacing.one,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    flex: 1,
  },
  statusSection: {
    marginTop: Spacing.one,
    gap: Spacing.two,
  },
  startRow: {
    marginBottom: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },
  comprobanteSection: {
    marginTop: Spacing.one,
  },
  textarea: {
    minHeight: 64,
    textAlignVertical: 'top',
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  confirmRow: {
    marginTop: Spacing.one,
  },
});