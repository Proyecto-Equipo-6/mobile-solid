import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';

import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { AdminFilterBar } from '@/features/admin-panel/components/AdminFilterBar';
import { DriverHistory } from '@/features/admin-panel/components/DriverHistory';
import { useAdminDrivers } from '@/features/admin-panel/hooks/useAdminInventory';
import { Pill } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

const STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: DashColors.success,
  OCUPADO: '#f59e0b',
  INACTIVO: DashColors.error,
};
const STATUS_LABELS: Record<string, string> = {
  DISPONIBLE: 'Activo',
  OCUPADO: 'Activo',
  INACTIVO: 'Inactivo',
};

export default function DriversScreen() {
  const dash = useDashTheme();
  const { drivers, isLoading, error, reload } = useAdminDrivers();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const isActive = (d: { status: string }) => d.status !== 'INACTIVO';

  const filtered = drivers.filter((d) => {
    if (filter === 'active') return isActive(d);
    if (filter === 'inactive') return !isActive(d);
    return true;
  });

  const termino = search.trim().toLowerCase();
  const rows = termino
    ? filtered.filter(
        (d) =>
          String(d.id).includes(termino) || d.name.toLowerCase().includes(termino),
      )
    : filtered;

  const activeCount = drivers.filter(isActive).length;
  const inactiveCount = drivers.filter((d) => !isActive(d)).length;

  if (selectedDriver) {
    const driver = drivers.find((d) => d.id === selectedDriver);
    if (driver) {
      return <DriverHistory driver={driver} onVolver={() => setSelectedDriver(null)} />;
    }
  }

  if (isLoading) {
    return <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}><ActivityIndicator color={dash.accent} /></ThemedView>;
  }

  if (error) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}>
        <ThemedText style={{ color: dash.textSecondary }}>{error}</ThemedText>
        <Pressable onPress={reload}><ThemedText style={{ color: DashColors.accent }}>Reintentar</ThemedText></Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerInfo}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Repartidores</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Consulta de la flota y sus métricas</ThemedText>
        </ThemedView>
      </ThemedView>

      <TextInput
        style={[
          styles.search,
          {
            color: dash.text,
            backgroundColor: dash.card,
            borderColor: dash.border,
          },
        ]}
        placeholder="Buscar por ID o nombre…"
        placeholderTextColor={dash.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <AdminFilterBar
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        allCount={drivers.length}
        filter={filter === 'all' ? 'active' : filter}
        showAll={filter === 'all'}
        onShowAll={() => setFilter('all')}
        onFilterChange={setFilter}
      />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedView style={styles.cardBody}>
              <ThemedText type="smallBold" style={{ color: dash.text }}>
                #{item.id} · {item.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>{item.email}</ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>{item.phone}</ThemedText>
              <ThemedView style={styles.metrics}>
                <ThemedText type="small" style={{ color: dash.textMuted }}>Hoy: {item.deliveriesToday}</ThemedText>
                <ThemedText type="small" style={{ color: dash.textMuted }}>Sem: {item.deliveriesWeek}</ThemedText>
                <ThemedText type="small" style={{ color: dash.textMuted }}>Mes: {item.deliveriesMonth}</ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.cardActions}>
              <Pill label={STATUS_LABELS[item.status] ?? item.status} color={STATUS_COLORS[item.status] ?? DashColors.textMuted} />
              <Pressable onPress={() => setSelectedDriver(item.id)}>
                <ThemedText style={{ color: DashColors.accent }}>Ver historial</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={
          <AdminEmptyState
            message={termino ? 'No se encontraron repartidores con ese criterio.' : 'No hay repartidores registrados.'}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three },
  headerInfo: { gap: 2 },
  search: {
    marginHorizontal: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  list: { gap: Spacing.two, padding: Spacing.three },
  card: { padding: Spacing.three, borderRadius: 12, borderWidth: 1, gap: Spacing.two },
  cardBody: { gap: 2 },
  cardActions: { gap: Spacing.two },
  metrics: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
});