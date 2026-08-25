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

function OrderHeader({ order }: { order: DeliveryOrder }) {
  const dash = useDashTheme();
  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerInfo}>
        <ThemedText type="smallBold" style={{ color: dash.text }}>
          {order.customerName}
        </ThemedText>
        <ThemedText type="small" style={{ color: dash.textSecondary }}>
          {formatDateTime(order.createdAt)}
        </ThemedText>
      </ThemedView>
      <Pill label={STATUS_LABELS[order.status] ?? order.status} color={STATUS_COLORS[order.status]} />
    </ThemedView>
  );
}

function OrderAddress({ order }: { order: DeliveryOrder }) {
  const dash = useDashTheme();
  return (
    <>
      <ThemedText type="small" style={{ color: dash.textSecondary }}>
        {order.address}
      </ThemedText>
      {order.customerPhone && (
        <ThemedText type="small" style={{ color: dash.textSecondary }}>
          {order.customerPhone}
        </ThemedText>
      )}
    </>
  );
}

function OrderProducts({ products }: { products: NonNullable<DeliveryOrder['products']> }) {
  const dash = useDashTheme();
  return (
    <ThemedView style={styles.productsSection}>
      <ThemedText type="smallBold" style={{ color: dash.text }}>
        Productos:
      </ThemedText>
      {products.map((p) => (
        <ThemedView key={p.id} style={styles.productRow}>
          <ThemedText type="small" style={[styles.productName, { color: dash.textSecondary }]}>
            {p.quantity}x {p.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            {formatCurrency(p.subtotal)}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

function OrderTotal({ total }: { total: number }) {
  const dash = useDashTheme();
  return (
    <ThemedView style={styles.recaudo}>
      <ThemedText type="small" style={{ color: dash.textMuted }}>
        Total a cobrar
      </ThemedText>
      <ThemedText type="smallBold" style={{ color: dash.text }}>
        {formatCurrency(total)}
      </ThemedText>
    </ThemedView>
  );
}

function StartDeliveryButton({
  isStarting,
  onStart,
}: {
  isStarting: boolean;
  onStart: () => void;
}) {
  return (
    <ThemedView style={styles.footerFull}>
      <Button label={isStarting ? 'Iniciando…' : 'Iniciar entrega'} pill loading={isStarting} onPress={onStart} />
    </ThemedView>
  );
}

function DeliveryStatusChips({
  selectedStatus,
  onSelect,
}: {
  selectedStatus: 'ENTREGADO' | 'NO_ENTREGADO' | null;
  onSelect: (status: 'ENTREGADO' | 'NO_ENTREGADO') => void;
}) {
  const dash = useDashTheme();
  const chips: { value: 'ENTREGADO' | 'NO_ENTREGADO'; label: string; color: string }[] = [
    { value: 'ENTREGADO', label: 'Entregado', color: '#16a34a' },
    { value: 'NO_ENTREGADO', label: 'No entregado', color: '#dc2626' },
  ];
  return (
    <ThemedView style={styles.statusRow}>
      {chips.map((chip) => (
        <Pressable key={chip.value} onPress={() => onSelect(chip.value)}>
          <ThemedView
            style={[
              styles.statusChip,
              {
                backgroundColor: selectedStatus === chip.value ? chip.color : dash.cardHover,
                borderColor: selectedStatus === chip.value ? chip.color : dash.border,
              },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: selectedStatus === chip.value ? '#ffffff' : dash.textSecondary }}>
              {chip.label}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
}

function DeliveryActionControls({
  selectedStatus,
  isUploading,
  comprobanteUploaded,
  onUploadComprobante,
  observation,
  onObservationChange,
  isConfirming,
  onConfirm,
}: {
  selectedStatus: 'ENTREGADO' | 'NO_ENTREGADO';
  isUploading: boolean;
  comprobanteUploaded: boolean;
  onUploadComprobante: () => void;
  observation: string;
  onObservationChange: (text: string) => void;
  isConfirming: boolean;
  onConfirm: () => void;
}) {
  const dash = useDashTheme();
  const isEntregado = selectedStatus === 'ENTREGADO';

  let comprobanteButtonLabel: string;
  if (isUploading) {
    comprobanteButtonLabel = 'Subiendo…';
  } else if (comprobanteUploaded) {
    comprobanteButtonLabel = 'Comprobante subido ✓';
  } else {
    comprobanteButtonLabel = 'Subir comprobante';
  }

  return (
    <ThemedView style={styles.actionsSection}>
      {isEntregado && (
        <ThemedView style={styles.comprobanteSection}>
          <Button
            label={comprobanteButtonLabel}
            variant={comprobanteUploaded ? 'secondary' : 'primary'}
            pill
            loading={isUploading}
            disabled={isUploading || comprobanteUploaded}
            onPress={onUploadComprobante}
          />
        </ThemedView>
      )}

      {!isEntregado && (
        <TextInput
          value={observation}
          onChangeText={onObservationChange}
          placeholder="Motivo de no entrega (obligatorio)..."
          placeholderTextColor={dash.textMuted}
          style={[styles.input, styles.textarea, { color: dash.text, backgroundColor: dash.cardHover, borderColor: dash.border }]}
          multiline
        />
      )}

      <ThemedView style={styles.confirmRow}>
        <Button
          label={isConfirming ? 'Confirmando…' : 'Confirmar'}
          pill
          loading={isConfirming}
          disabled={isConfirming || isUploading}
          onPress={onConfirm}
          style={{ backgroundColor: !isEntregado ? '#7f1d1d' : dash.accent }}
        />
      </ThemedView>
    </ThemedView>
  );
}

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
  const isActive = isAssigned || order.status === 'in_transit';
  const showStartButton = isAssigned && onStart && !onStatusSelect;
  const showStatusSection = isActive && onStatusSelect;

  return (
    <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
      <OrderHeader order={order} />
      <OrderAddress order={order} />

      {order.products && order.products.length > 0 && <OrderProducts products={order.products} />}

      <OrderTotal total={order.total} />

      {showStartButton && <StartDeliveryButton isStarting={isStarting ?? false} onStart={onStart} />}

      {showStatusSection && (
        <ThemedView style={styles.statusSection}>
          {isAssigned && onStart && (
            <ThemedView style={styles.startRow}>
              <Button label={isStarting ? 'Iniciando…' : 'Iniciar entrega'} pill loading={isStarting} onPress={onStart} />
            </ThemedView>
          )}

          <ThemedText type="smallBold" style={{ color: dash.text }}>
            Estado del pedido:
          </ThemedText>

          <DeliveryStatusChips selectedStatus={selectedStatus ?? null} onSelect={onStatusSelect} />

          {selectedStatus && (
            <DeliveryActionControls
              selectedStatus={selectedStatus}
              isUploading={isUploading ?? false}
              comprobanteUploaded={comprobanteUploaded ?? false}
              onUploadComprobante={onUploadComprobante!}
              observation={observation ?? ''}
              onObservationChange={onObservationChange!}
              isConfirming={isConfirming ?? false}
              onConfirm={onConfirm!}
            />
          )}
        </ThemedView>
      )}
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
  actionsSection: {
    gap: Spacing.two,
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
