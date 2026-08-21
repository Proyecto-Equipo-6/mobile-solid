import { StyleSheet, View } from 'react-native';

import { useAdminInventory, useAdminOrders } from '@/features/admin-panel/hooks/useAdminInventory';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatCurrency } from '@/shared/utils/format';

export default function AdminDashboardScreen() {
  const { summary, isLoading: loadingInventory } = useAdminInventory();
  const { orders, isLoading: loadingOrders } = useAdminOrders();
  const dash = useDashTheme();

  const loading = loadingInventory || loadingOrders;

  const totalOrders = summary?.totalOrders ?? orders.length;
  const totalRevenue = summary?.totalSales ?? orders.reduce((acc, order) => acc + order.total, 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const inTransit = orders.filter((order) => order.status === 'in_transit').length;

  const metrics = [
    { id: 'productos', label: 'Productos', value: String(summary?.totalProducts ?? 0) },
    { id: 'sin-stock', label: 'No disponibles', value: String(summary?.unavailableProducts ?? 0) },
    { id: 'pedidos', label: 'Pedidos', value: String(totalOrders) },
    { id: 'ventas', label: 'Ventas', value: formatCurrency(totalRevenue) },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.cabecera}>
        <ThemedText style={styles.bienvenida}>Panel de administración</ThemedText>
        <ThemedText style={styles.subtitulo}>
          {loading ? 'Cargando reportes…' : 'Resumen general de tu tienda Nexbit'}
        </ThemedText>
      </ThemedView>

      <View style={styles.metricas}>
        {metrics.map((metrica) => (
          <ThemedView key={metrica.id} style={[styles.tarjeta, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedText style={styles.metricaValor}>{metrica.value}</ThemedText>
            <ThemedText style={styles.metricaLabel}>{metrica.label}</ThemedText>
          </ThemedView>
        ))}
      </View>

      <ThemedView style={[styles.seccion, { backgroundColor: dash.card, borderColor: dash.border }]}>
        <ThemedText style={styles.seccionTitulo}>Pedidos en curso</ThemedText>
        <View style={styles.fila}>
          <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
          <ThemedText style={styles.filaTexto}>Pendientes</ThemedText>
          <ThemedText style={styles.filaValor}>{pendingOrders}</ThemedText>
        </View>
        <View style={styles.fila}>
          <View style={[styles.dot, { backgroundColor: '#0e7490' }]} />
          <ThemedText style={styles.filaTexto}>En camino</ThemedText>
          <ThemedText style={styles.filaValor}>{inTransit}</ThemedText>
        </View>
        <View style={styles.fila}>
          <View style={[styles.dot, { backgroundColor: '#16a34a' }]} />
          <ThemedText style={styles.filaTexto}>Entregados</ThemedText>
          <ThemedText style={styles.filaValor}>
            {orders.filter((order) => order.status === 'delivered').length}
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.three,
  },
  cabecera: {
    marginBottom: Spacing.three,
  },
  bienvenida: {
    color: DashColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitulo: {
    color: DashColors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.one,
  },
  metricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  tarjeta: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.one,
  },
  metricaValor: {
    color: DashColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  metricaLabel: {
    color: DashColors.textMuted,
    fontSize: 13,
  },
  seccion: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.two,
  },
  seccionTitulo: {
    color: DashColors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  filaTexto: {
    flex: 1,
    color: DashColors.textSecondary,
    fontSize: 14,
  },
  filaValor: {
    color: DashColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});