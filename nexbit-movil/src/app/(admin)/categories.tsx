import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminConfirmDialog } from '@/features/admin-panel/components/AdminConfirmDialog';
import { AdminCrudModal } from '@/features/admin-panel/components/AdminCrudModal';
import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { AdminFilterBar } from '@/features/admin-panel/components/AdminFilterBar';
import { useAdminCategories } from '@/features/admin-panel/hooks/useAdminInventory';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { Pill } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

export default function CategoriesScreen() {
  const dash = useDashTheme();
  const { categories, isLoading, error, create, update, remove, reload } = useAdminCategories();
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = categories.filter((c) => (filter === 'active' ? c.active : !c.active));
  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

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
    setEditingId(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }

  function handleEdit(item: { id: string; name: string; description: string }) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setShowForm(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = { nombre: name, descripcion: description, estado: 'Activo' };
      if (editingId) {
        await update(editingId, payload);
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
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Categorías</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Gestión de categorías de productos</ThemedText>
        </ThemedView>
        <Button label="+ Nueva" pill onPress={handleNew} />
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
              <ThemedText type="small" style={{ color: dash.textSecondary }} numberOfLines={2}>{item.description}</ThemedText>
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
        ListEmptyComponent={<AdminEmptyState message="No hay categorías en esta vista." />}
      />

      <AdminCrudModal visible={showForm} title={editingId ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setShowForm(false)}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de la categoría" />
        <Field label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción (opcional)" />
        <ThemedView style={styles.modalActions}>
          <Pressable onPress={() => setShowForm(false)}><ThemedText type="small" style={{ color: dash.textMuted }}>Cancelar</ThemedText></Pressable>
          <Button label={editingId ? 'Actualizar' : 'Guardar'} pill loading={isSaving} disabled={!name} onPress={handleSave} />
        </ThemedView>
      </AdminCrudModal>

      <AdminConfirmDialog
        visible={deletingId !== null}
        title="Eliminar categoría"
        message="¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer."
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
