import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import * as orderService from '@/features/cart/services/order.service';
import type { Order } from '@/features/cart/types/cart.types';
import { Pill, STATUS_COLORS, STATUS_LABELS } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency, formatDateTime } from '@/shared/utils/format';

export default function OrdersScreen() {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders(showLoading = false) {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const data = await orderService.listMyOrders();
      setOrders(data.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar tus pedidos');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await orderService.listMyOrders();
        if (active) {
          setOrders(data.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar tus pedidos');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cabecera}>
        <ThemedText type="subtitle">Mis pedidos</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Sigue el estado de tus compras en tiempo real.
        </ThemedText>
      </ThemedView>

      {error && (
        <ThemedView style={styles.errorWrap}>
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
          <Pressable onPress={() => loadOrders(true)}>
            <ThemedText type="link">Reintentar</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView style={[styles.card, { borderColor: theme.border, borderWidth: 1 }]}>
            <ThemedView style={styles.cardHeader}>
              <ThemedView style={styles.cardId}>
                <ThemedText type="smallBold">Pedido</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  #{item.id.slice(0, 8).toUpperCase()}
                </ThemedText>
              </ThemedView>
              <Pill label={STATUS_LABELS[item.status] ?? item.status} color={STATUS_COLORS[item.status]} />
            </ThemedView>

            <ThemedView style={[styles.divider, { backgroundColor: theme.border }]} />

            <ThemedView style={styles.cardFooter}>
              <ThemedView>
                <ThemedText type="small" themeColor="textSecondary">
                  {formatDateTime(item.createdAt)}
                </ThemedText>
                {item.deliveryAddress ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.deliveryAddress}
                  </ThemedText>
                ) : null}
              </ThemedView>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                {formatCurrency(item.total)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={
          <ThemedView style={styles.vacio}>
            <ThemedText themeColor="textSecondary">Aún no has realizado pedidos.</ThemedText>
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
  },
  cabecera: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  errorWrap: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.five,
  },
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardId: {
    gap: Spacing.half,
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
  linea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  lineaNombre: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.three,
  },
  vacio: {
    padding: Spacing.four,
    alignItems: 'center',
  },
});