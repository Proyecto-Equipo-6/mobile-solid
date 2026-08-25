import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { AdminConfirmDialog } from '@/features/admin-panel/components/AdminConfirmDialog';
import { AdminCrudModal } from '@/features/admin-panel/components/AdminCrudModal';
import { AdminEmptyState } from '@/features/admin-panel/components/AdminEmptyState';
import { AdminFilterBar } from '@/features/admin-panel/components/AdminFilterBar';
import { useAdminUsers } from '@/features/admin-panel/hooks/useAdminInventory';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { Pill } from '@/shared/components/pill';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

const ROL_COLORS: Record<string, string> = {
  '1': DashColors.error,
  '2': DashColors.accent,
  '3': '#f59e0b',
};
const ROL_NAMES: Record<string, string> = {
  '1': 'Admin',
  '2': 'Cliente',
  '3': 'Repartidor',
};

export default function UsersScreen() {
  const dash = useDashTheme();
  const { users, roles, isLoading, error, create, update, remove, reload } = useAdminUsers();
  const [filter, setFilter] = useState<'active' | 'inactive'>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('2');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = users.filter((u) => (filter === 'active' ? u.active : !u.active));
  const activeCount = users.filter((u) => u.active).length;
  const inactiveCount = users.filter((u) => !u.active).length;

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
    setEditingId(null); setName(''); setEmail(''); setPhone(''); setPassword(''); setRoleId('2');
    setShowForm(true);
  }

  function handleEdit(item: { id: string; name: string; email: string; phone: string; roleId: string }) {
    setEditingId(item.id); setName(item.name); setEmail(item.email); setPhone(item.phone); setRoleId(item.roleId);
    setShowForm(true);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await update(editingId, { nombre_apellido: name, email, telefono: phone, id_rol: Number(roleId) });
      } else {
        await create({ nombre_apellido: name, email, password, telefono: phone, id_rol: Number(roleId) });
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
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>Usuarios</ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>Gestión de usuarios del sistema</ThemedText>
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
            </ThemedView>
            <ThemedView style={styles.cardActions}>
              <ThemedView style={styles.row}>
                <Pill label={ROL_NAMES[item.roleId] ?? 'Rol'} color={ROL_COLORS[item.roleId] ?? DashColors.textMuted} />
                <Pill label={item.active ? 'Activo' : 'Inactivo'} color={item.active ? DashColors.success : DashColors.error} />
              </ThemedView>
              <ThemedView style={styles.row}>
                {item.active ? (
                  <>
                    <Pressable onPress={() => handleEdit(item)}><ThemedText style={{ color: DashColors.accent }}>Editar</ThemedText></Pressable>
                    <Pressable onPress={() => setDeletingId(item.id)}><ThemedText style={{ color: DashColors.error }}>Eliminar</ThemedText></Pressable>
                  </>
                ) : (
                  <Pressable onPress={() => setDeletingId(item.id)}><ThemedText style={{ color: DashColors.success }}>Reactivar</ThemedText></Pressable>
                )}
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
        ListEmptyComponent={<AdminEmptyState message="No hay usuarios en esta vista." />}
      />

      <AdminCrudModal visible={showForm} title={editingId ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setShowForm(false)}>
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Nombre y apellido" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="10 dígitos" keyboardType="numeric" />
        {!editingId && <Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Entre 4 y 8 caracteres" secureTextEntry />}
        <ThemedText type="smallBold" style={{ color: dash.textSecondary, fontSize: 12 }}>Rol</ThemedText>
        <ThemedView style={styles.chips}>
          {roles.map((r) => (
            <Pressable key={r.id} onPress={() => setRoleId(r.id)}>
              <ThemedView style={[styles.chip, { backgroundColor: roleId === r.id ? dash.accent : dash.cardHover, borderColor: roleId === r.id ? dash.accent : dash.border, borderWidth: 1 }]}>
                <ThemedText type="smallBold" style={{ color: roleId === r.id ? dash.sobreAccent : dash.textSecondary, fontSize: 12 }}>{r.name}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </ThemedView>
        <ThemedView style={styles.modalActions}>
          <Pressable onPress={() => setShowForm(false)}><ThemedText type="small" style={{ color: dash.textMuted }}>Cancelar</ThemedText></Pressable>
          <Button label={editingId ? 'Actualizar' : 'Guardar'} pill loading={isSaving} disabled={!name || !email || !phone || (!editingId && !password)} onPress={handleSave} />
        </ThemedView>
      </AdminCrudModal>

      <AdminConfirmDialog
        visible={deletingId !== null}
        title={users.find((u) => u.id === deletingId)?.active ? 'Eliminar usuario' : 'Reactivar usuario'}
        message={users.find((u) => u.id === deletingId)?.active ? '¿Estás seguro de eliminar este usuario?' : '¿Reactivar este usuario?'}
        confirmLabel={users.find((u) => u.id === deletingId)?.active ? 'Eliminar' : 'Reactivar'}
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
  row: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.two, borderRadius: 999 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.two },
});
