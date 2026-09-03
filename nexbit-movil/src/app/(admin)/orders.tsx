import { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, Pressable, StyleSheet, View } from 'react-native';

import { OrderAssigneeModal } from '@/features/admin-panel/components/OrderAssigneeModal';
import { OrderDeliverModal } from '@/features/admin-panel/components/OrderDeliverModal';
import { useAdminOrders } from '@/features/admin-panel/hooks/useAdminInventory';
import { Pill, STATUS_COLORS, STATUS_LABELS } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';

export default function OrdersScreen() {
  const dash = useDashTheme();
  const { orders, drivers, isLoading, error, assignOrder, confirmOrder, deliverOrder, reload } = useAdminOrders();
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);
  const [comprobanteImageUrl, setComprobanteImageUrl] = useState<string | null>(null);
  const [comprobanteLoaded, setComprobanteLoaded] = useState(false);

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

  async function handleConfirm(orderId: string) {
    if (isConfirmingId !== null) {
      return;
    }
    setIsConfirmingId(orderId);
    try {
      await confirmOrder(orderId);
    } finally {
      setIsConfirmingId(null);
    }
  }

  async function handleDeliver(imagen: { uri: string; mimeType: string; base64?: string }, observacion?: string) {
    if (deliveringOrderId === null) {
      return;
    }
    setIsDelivering(true);
    try {
      await deliverOrder(deliveringOrderId, imagen, observacion);
    } finally {
      setIsDelivering(false);
      setDeliveringOrderId(null);
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView style={[styles.orderCard, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedView style={styles.orderHeader}>
              <ThemedView style={styles.orderId}>
                <ThemedText type="smallBold" style={{ color: dash.text }}>
                  {item.customerName}
                </ThemedText>
                <ThemedText type="small" style={{ color: dash.textSecondary }}>
                  {formatDateTime(item.createdAt)}
                </ThemedText>
              </ThemedView>
              <Pill
                label={STATUS_LABELS[item.status] ?? item.status}
                color={STATUS_COLORS[item.status]}
              />
            </ThemedView>
            <ThemedText type="small" style={{ color: dash.textSecondary }}>
              {item.address}
            </ThemedText>
            <ThemedView style={styles.orderFooter}>
              <ThemedText type="smallBold" style={{ color: dash.text }}>
                {formatCurrency(item.total)}
              </ThemedText>
              <ThemedView style={styles.acciones}>
                {item.comprobanteUrl && (
                  <Pressable onPress={() => { setComprobanteImageUrl(item.comprobanteUrl ?? null); setComprobanteLoaded(false); }}>
                    <ThemedText style={[styles.enlace, { color: DashColors.success }]}>Ver comprobante</ThemedText>
                  </Pressable>
                )}
                {item.status === 'pending' && (
                  <Pressable onPress={() => handleConfirm(item.id)} disabled={isConfirmingId !== null}>
                    <ThemedText style={styles.enlace}>
                      {isConfirmingId === item.id ? 'Confirmando…' : 'Confirmar'}
                    </ThemedText>
                  </Pressable>
                )}
                {!item.driverId && (
                  <Pressable onPress={() => setAssigningOrderId(item.id)}>
                    <ThemedText style={styles.enlace}>Asignar repartidor</ThemedText>
                  </Pressable>
                )}
                {item.driverId && (item.status === 'in_transit' || item.status === 'assigned') && (
                  <Pressable onPress={() => setDeliveringOrderId(item.id)} disabled={isDelivering}>
                    <ThemedText style={[styles.enlace, { color: DashColors.success }]}>Entregar</ThemedText>
                  </Pressable>
                )}
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedView style={styles.vacio}>
            <ThemedText style={{ color: dash.textSecondary }}>No hay pedidos registrados.</ThemedText>
          </ThemedView>
        }
      />

      <OrderAssigneeModal
        visible={assigningOrderId !== null}
        drivers={drivers}
        isAssigning={isAssigning}
        onSelect={handleAssign}
        onClose={() => setAssigningOrderId(null)}
      />

      <OrderDeliverModal
        visible={deliveringOrderId !== null}
        orderId={deliveringOrderId || ''}
        onClose={() => setDeliveringOrderId(null)}
        onDeliver={handleDeliver}
        isLoading={isDelivering}
      />

      <Modal
        visible={comprobanteImageUrl !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setComprobanteImageUrl(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setComprobanteImageUrl(null)}>
          <ThemedView style={[styles.modalContent, { backgroundColor: dash.card }]}>
            <ThemedText type="smallBold" style={{ color: dash.text, marginBottom: Spacing.two }}>
              Comprobante de entrega
            </ThemedText>
            <View style={styles.imageContainer}>
              {!comprobanteLoaded && (
                <ActivityIndicator color={dash.accent} style={styles.imageLoader} />
              )}
              {comprobanteImageUrl ? (
                <Image
                  source={{ uri: comprobanteImageUrl }}
                  style={[styles.comprobanteImage, !comprobanteLoaded && { opacity: 0 }]}
                  resizeMode="contain"
                  onLoad={() => setComprobanteLoaded(true)}
                  onError={() => setComprobanteLoaded(true)}
                />
              ) : null}
            </View>
            <Pressable onPress={() => setComprobanteImageUrl(null)} style={styles.cerrarBtn}>
              <ThemedText style={[styles.enlace, { color: dash.text }]}>Cerrar</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
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
  errorTexto: {
    color: DashColors.textSecondary,
  },
  enlace: {
    color: DashColors.accent,
    fontWeight: '600',
  },
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  orderCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  orderId: {
    flex: 1,
    gap: Spacing.half,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  acciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  vacio: {
    padding: Spacing.four,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  comprobanteImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute',
  },
  cerrarBtn: {
    marginTop: Spacing.two,
    padding: Spacing.two,
  },
});