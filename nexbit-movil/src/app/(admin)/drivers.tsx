import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminConfirmDialog } from '@/features/admin-panel/components/AdminConfirmDialog';
import { AdminCrudModal } from '@/features/admin-panel/components/AdminCrudModal';
import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { AdminFilterBar } from '@/features/admin-panel/components/AdminFilterBar';
import { useAdminDrivers } from '@/features/admin-panel/hooks/useAdminInventory';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
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
  DISPONIBLE: 'Disponible',
  OCUPADO: 'Ocupado',
  INACTIVO: 'Inactivo',
};

export default function DriversScreen() {
  const dash = useDashTheme();
  const { drivers, isLoading, error, create, update, remove, reload } = useAdminDrivers();
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [plate, setPlate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = drivers.filter((d) => {
    if (filter === 'active') return d.status !== 'INACTIVO';
    return d.status === 'INACTIVO';
  });
  const activeCount = drivers.filter((d) => d.status !== 'INACTIVO').length;
  const inactiveCount = drivers.filter((d) => d.status === 'INACTIVO').length;

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

  function handleNew() {
    setEditingId(null); setName(''); setEmail(''); setPhone(''); setPassword(''); setVehicle(''); setPlate('');
    setShowForm(true);
  }

  function handleEdit(item: { id: string; name: string; email: string; phone: string }) {
    setEditingId(item.id); setName(item.name); setEmail(item.email); setPhone(item.phone);
    setShowForm(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await update(editingId, { nombre_apellido: name, email, telefono: phone, vehiculo: vehicle, placa: plate });
      } else {
        await create({ nombre_apellido: name, email, password, telefono: phone, vehiculo: vehicle, placa: plate });
      }
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId || isDeleting) return;
    setIsDeleting(true);
    try {
      await remove(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerInfo}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Repartidores</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Gestión de repartidores</ThemedText>
        </ThemedView>
        <Button label="+ Nuevo" pill onPress={handleNew} />
      </ThemedView>

      <AdminFilterBar activeCount={activeCount} inactiveCount={inactiveCount} filter={filter} onFilterChange={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedView style={styles.cardBody}>
              <ThemedText type="smallBold" style={{ color: dash.text }}>{item.name}</ThemedText>
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
              <ThemedView style={styles.row}>
                <Pressable onPress={() => handleEdit(item)}><ThemedText style={{ color: DashColors.accent }}>Editar</ThemedText></Pressable>
                <Pressable onPress={() => setDeletingId(item.id)}><ThemedText style={{ color: DashColors.error }}>Eliminar</ThemedText></Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={<AdminEmptyState message="No hay repartidores en esta vista." />}
      />

      <AdminCrudModal visible={showForm} title={editingId ? 'Editar repartidor' : 'Nuevo repartidor'} onClose={() => setShowForm(false)}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre y apellido" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="10 dígitos" keyboardType="numeric" />
        {!editingId && <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Entre 4 y 8 caracteres" secureTextEntry />}
        <Field label="Vehículo" value={vehicle} onChangeText={setVehicle} placeholder="Ej: Moto, Bicicleta" />
        <Field label="Placa" value={plate} onChangeText={setPlate} placeholder="Ej: ABC-123" autoCapitalize="characters" />
        <ThemedView style={styles.modalActions}>
          <Pressable onPress={() => setShowForm(false)}><ThemedText type="small" style={{ color: dash.textMuted }}>Cancelar</ThemedText></Pressable>
          <Button label={editingId ? 'Actualizar' : 'Guardar'} pill loading={isSaving} disabled={!name || !email || !phone || (!editingId && !password)} onPress={handleSave} />
        </ThemedView>
      </AdminCrudModal>

      <AdminConfirmDialog
        visible={deletingId !== null}
        title="Eliminar repartidor"
        message="¿Estás seguro de eliminar este repartidor? Se desactivará su cuenta de usuario."
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three },
  headerInfo: { gap: 2 },
  list: { gap: Spacing.two, padding: Spacing.three },
  card: { padding: Spacing.three, borderRadius: 12, borderWidth: 1, gap: Spacing.two },
  cardBody: { gap: 2 },
  cardActions: { gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three },
  metrics: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.one },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
});
