import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { listDriverOrders } from '@/features/admin-panel/services/admin.service';
import type { AdminOrder, RepartidorAdmin } from '@/features/admin-panel/types/admin.types';
import { Pill, STATUS_COLORS, STATUS_LABELS } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatDateTime } from '@/shared/utils/format';

const ESTADOS_FINALES = ['ENTREGADO', 'NO_ENTREGADO', 'CANCELADO'];

export function DriverHistory({
  driver,
  onVolver,
}: Readonly<{ driver: RepartidorAdmin; onVolver: () => void }>) {
  const dash = useDashTheme();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listDriverOrders(driver.id);
        if (!cancelled) {
          setOrders(data.filter((o) => ESTADOS_FINALES.includes(o.estadoRaw)));
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar el historial.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [driver.id]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.header}>
        <Pressable onPress={onVolver}>
          <ThemedText style={{ color: DashColors.accent }}>← Volver</ThemedText>
        </Pressable>
        <ThemedView style={styles.headerInfo}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>
            Historial de {driver.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            Pedidos finalizados del más reciente al más antiguo.
          </ThemedText>
        </ThemedView>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={styles.centered}>
          <ActivityIndicator color={dash.accent} />
        </ThemedView>
      ) : error ? (
        <ThemedView style={styles.centered}>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            {error}
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
              <ThemedView style={styles.cardHeader}>
                <ThemedText type="smallBold" style={{ color: dash.text }}>
                  Pedido #{item.id}
                </ThemedText>
                <Pill
                  label={STATUS_LABELS[item.status] ?? item.estadoRaw}
                  color={STATUS_COLORS[item.status]}
                />
              </ThemedView>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>
                {item.customerName}
              </ThemedText>
              <ThemedText type="small" style={{ color: dash.textMuted }}>
                {item.address || 'Sin dirección'}
              </ThemedText>
              <ThemedText type="small" style={{ color: dash.textMuted }}>
                {formatDateTime(item.createdAt)}
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={<AdminEmptyState message="No hay pedidos registrados para este repartidor." />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  headerInfo: { flex: 1, gap: 2 },
  list: { gap: Spacing.two, padding: Spacing.three },
  card: { padding: Spacing.three, borderRadius: 12, borderWidth: 1, gap: 4 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});