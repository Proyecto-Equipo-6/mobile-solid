import { ActivityIndicator, Modal, Pressable, StyleSheet } from 'react-native';

import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type AdminConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AdminConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Eliminar',
  isLoading,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const dash = useDashTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <ThemedView style={[styles.dialog, { backgroundColor: dash.card, borderColor: dash.border }]}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>
            {title}
          </ThemedText>
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            {message}
          </ThemedText>
          <ThemedView style={styles.actions}>
            <Pressable onPress={onCancel} disabled={isLoading}>
              <ThemedText type="small" style={{ color: dash.textMuted, padding: Spacing.two }}>
                Cancelar
              </ThemedText>
            </Pressable>
            {isLoading ? (
              <ActivityIndicator color={DashColors.error} />
            ) : (
              <Button label={confirmLabel} variant="danger" pill onPress={onConfirm} />
            )}
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
