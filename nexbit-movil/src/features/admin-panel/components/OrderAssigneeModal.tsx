import { ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';

import type { DriverOption } from '@/features/admin-panel/types/admin.types';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type OrderAssigneeModalProps = {
  visible: boolean;
  drivers: DriverOption[];
  isAssigning?: boolean;
  onSelect: (driverId: string) => void;
  onClose: () => void;
};

export function OrderAssigneeModal({
  visible,
  drivers,
  isAssigning,
  onSelect,
  onClose,
}: OrderAssigneeModalProps) {
  const dash = useDashTheme();

  const availableDrivers = drivers.filter((driver) => driver.available === true);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}>
        <ThemedView style={[styles.modal, { backgroundColor: dash.card, borderColor: dash.border }]}>
          <ThemedText style={styles.titulo}>Asignar repartidor</ThemedText>

          {availableDrivers.length === 0 && (
            <ThemedText type="small" style={{ color: dash.textSecondary }}>
              No hay repartidores disponibles.
            </ThemedText>
          )}

          {availableDrivers.map((driver) => (
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
                <ThemedText type="smallBold" style={{ color: dash.text }}>
                  {driver.name}
                </ThemedText>
                {driver.phone && (
                  <ThemedText type="small" style={{ color: dash.textMuted }}>
                    {driver.phone}
                  </ThemedText>
                )}
              </ThemedView>
            </Pressable>
          ))}

          {isAssigning && <ActivityIndicator color={dash.accent} />}

          <Button label="Cancelar" variant="secondary" onPress={onClose} />
        </ThemedView>
      </ThemedView>
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
    padding: Spacing.three,
    borderRadius: 8,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});