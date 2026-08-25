import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminConfirmDialog } from '@/features/admin-panel/components/AdminConfirmDialog';
import { AdminCrudModal } from '@/features/admin-panel/components/AdminCrudModal';
import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { useAdminRoles } from '@/features/admin-panel/hooks/useAdminInventory';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

export default function RolesScreen() {
  const dash = useDashTheme();
  const { roles, isLoading, error, create, update, reload } = useAdminRoles();
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

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
        <ThemedText style={{ color: dash.textSecondary }}>{error}</ThemedText>
        <Pressable onPress={reload}>
          <ThemedText style={{ color: DashColors.accent }}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  function handleNew() {
    setEditingRole(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }

  function handleEdit(role: { id: string; name: string; description: string }) {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description);
    setShowForm(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingRole) {
        await update(editingRole.id, { name, description });
      } else {
        await create({ name, description });
      }
      setShowForm(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerInfo}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Roles</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Gestión de roles del sistema</ThemedText>
        </ThemedView>
        <Button label="+ Nuevo" pill onPress={handleNew} />
      </ThemedView>

      <FlatList
        data={roles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView style={[styles.card, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedView style={styles.cardBody}>
              <ThemedText type="smallBold" style={{ color: dash.text }}>{item.name}</ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>{item.description}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.cardActions}>
              <Pressable onPress={() => handleEdit(item)}>
                <ThemedText style={{ color: DashColors.accent }}>Editar</ThemedText>
              </Pressable>
              <Pressable onPress={() => setShowDeleteWarning(true)}>
                <ThemedText style={{ color: DashColors.error }}>Eliminar</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={<AdminEmptyState message="No hay roles registrados." />}
      />

      <AdminCrudModal visible={showForm} title={editingRole ? 'Editar rol' : 'Nuevo rol'} onClose={() => setShowForm(false)}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre del rol" />
        <Field label="Descripción" value={description} onChangeText={setDescription} placeholder="Descripción del rol" />
        <ThemedView style={styles.modalActions}>
          <Pressable onPress={() => setShowForm(false)}>
            <ThemedText type="small" style={{ color: dash.textMuted }}>Cancelar</ThemedText>
          </Pressable>
          <Button label={editingRole ? 'Actualizar' : 'Guardar'} pill loading={isSaving} disabled={!name} onPress={handleSave} />
        </ThemedView>
      </AdminCrudModal>

      <AdminConfirmDialog
        visible={showDeleteWarning}
        title="No se pueden eliminar roles"
        message="Los roles son fundamentales para el funcionamiento del sistema. Eliminarlos podría dañar la aplicación. Si necesitas modificar un rol, edita su nombre o descripción."
        confirmLabel="Entendido"
        onConfirm={() => setShowDeleteWarning(false)}
        onCancel={() => setShowDeleteWarning(false)}
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
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, borderRadius: 12, borderWidth: 1 },
  cardBody: { flex: 1, gap: 2 },
  cardActions: { gap: Spacing.two, alignItems: 'flex-end' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
});
