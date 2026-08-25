import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminConfirmDialog } from '@/features/admin-panel/components/AdminConfirmDialog';
import { AdminCrudModal } from '@/features/admin-panel/components/AdminCrudModal';
import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { AdminFilterBar } from '@/features/admin-panel/components/AdminFilterBar';
import { useAdminSuppliers } from '@/features/admin-panel/hooks/useAdminInventory';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { Pill } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

export default function SuppliersScreen() {
  const dash = useDashTheme();
  const { suppliers, isLoading, error, create, update, remove, reload } = useAdminSuppliers();
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = suppliers.filter((s) => (filter === 'active' ? s.active : !s.active));
  const activeCount = suppliers.filter((s) => s.active).length;
  const inactiveCount = suppliers.filter((s) => !s.active).length;

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
    setEditingId(null); setName(''); setNit(''); setEmail(''); setPhone('');
    setShowForm(true);
  }

  function handleEdit(item: { id: string; name: string; nit: string; email: string; phone: string }) {
    setEditingId(item.id); setName(item.name); setNit(item.nit); setEmail(item.email); setPhone(item.phone);
    setShowForm(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { nit_proveedor: nit, razon_social: name, telefono: phone, email };
      if (editingId) {
        await update(editingId, { ...payload, estado: 1 });
      } else {
        await create(payload);
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
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Proveedores</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Gestión de proveedores</ThemedText>
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
              <ThemedText type="small" style={{ color: dash.textSecondary }}>NIT: {item.nit}</ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>{item.email}</ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>{item.phone}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.cardActions}>
              <Pill label={item.active ? 'Activo' : 'Inactivo'} color={item.active ? DashColors.success : DashColors.error} />
              <ThemedView style={styles.row}>
                <Pressable onPress={() => handleEdit(item)}><ThemedText style={{ color: DashColors.accent }}>Editar</ThemedText></Pressable>
                <Pressable onPress={() => setDeletingId(item.id)}><ThemedText style={{ color: DashColors.error }}>Eliminar</ThemedText></Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={<AdminEmptyState message="No hay proveedores en esta vista." />}
      />

      <AdminCrudModal visible={showForm} title={editingId ? 'Editar proveedor' : 'Nuevo proveedor'} onClose={() => setShowForm(false)}>
        <Field label="Razón Social" value={name} onChangeText={setName} placeholder="Nombre del proveedor" />
        <Field label="NIT" value={nit} onChangeText={setNit} placeholder="Ej: 900123456-7" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="correo@proveedor.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="10 dígitos" keyboardType="numeric" />
        <ThemedView style={styles.modalActions}>
          <Pressable onPress={() => setShowForm(false)}><ThemedText type="small" style={{ color: dash.textMuted }}>Cancelar</ThemedText></Pressable>
          <Button label={editingId ? 'Actualizar' : 'Guardar'} pill loading={isSaving} disabled={!name || !nit || !email || !phone} onPress={handleSave} />
        </ThemedView>
      </AdminCrudModal>

      <AdminConfirmDialog
        visible={deletingId !== null}
        title="Desactivar proveedor"
        message="¿Estás seguro de desactivar este proveedor?"
        confirmLabel="Desactivar"
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
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: Spacing.three },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
});
