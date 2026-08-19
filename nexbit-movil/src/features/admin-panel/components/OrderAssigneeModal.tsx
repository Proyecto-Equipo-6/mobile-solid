import { ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';

import type { DriverOption } from '@/features/admin-panel/types/admin.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

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
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.backdrop}>
        <ThemedView type="backgroundElement" style={styles.modal}>
          <ThemedText type="subtitle">Asignar repartidor</ThemedText>

          {drivers.map((driver) => (
            <Pressable
              key={driver.id}
              onPress={() => onSelect(driver.id)}
              disabled={isAssigning}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedView type="backgroundSelected" style={styles.driverRow}>
                <ThemedText type="smallBold">{driver.name}</ThemedText>
                {driver.phone && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {driver.phone}
                  </ThemedText>
                )}
              </ThemedView>
            </Pressable>
          ))}

          {isAssigning && <ActivityIndicator />}

          <Pressable onPress={onClose}>
            <ThemedText type="small" themeColor="textSecondary">
              Cancelar
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modal: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  driverRow: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
});