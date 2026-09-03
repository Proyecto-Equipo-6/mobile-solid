import { ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';

import type { DriverOption } from '@/features/admin-panel/types/admin.types';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type OrderAssigneeModalProps = Readonly<{
  visible: boolean;
  drivers: DriverOption[];
  isAssigning?: boolean;
  onSelect: (driverId: string) => void;
  onClose: () => void;
}>;

export function OrderAssigneeModal({
  visible,
  drivers,
  isAssigning,
  onSelect,
  onClose,
}: OrderAssigneeModalProps) {
  const dash = useDashTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} onPress={onClose}>
        <ThemedView style={[styles.modal, { backgroundColor: dash.card, borderColor: dash.border }]}>
          <ThemedText style={styles.titulo}>Asignar repartidor</ThemedText>

          {drivers.length === 0 ? (
            <ThemedText type="small" style={{ color: dash.textSecondary }}>
              No hay repartidores registrados.
            </ThemedText>
          ) : (
            drivers.map((driver) => (
              <Pressable
                key={driver.id}
                onPress={() => onSelect(driver.id)}
                disabled={isAssigning}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView
                  style={[
                    styles.driverRow,
                    { backgroundColor: dash.cardHover, borderColor: dash.border, borderWidth: 1 },
                  ]}>
                  <ThemedView style={styles.driverInfo}>
                    <ThemedText type="smallBold" style={{ color: dash.text }}>
                      {driver.name}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: dash.textMuted }}>
                      {driver.phone
                        ? `${driver.phone} · ${driver.deliveriesToday ?? 0} hoy`
                        : `${driver.deliveriesToday ?? 0} hoy`}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </Pressable>
            ))
          )}

          {isAssigning && <ActivityIndicator color={dash.accent} />}

          <Button label="Cancelar" variant="secondary" onPress={onClose} />
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modal: {
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  titulo: {
    color: DashColors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 8,
    gap: Spacing.two,
  },
  driverInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});