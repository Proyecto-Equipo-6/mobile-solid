import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

type CashCollectModalProps = {
  visible: boolean;
  orderTotal: number;
  isSubmitting?: boolean;
  onConfirm: (amountCollected: number) => void;
  onClose: () => void;
};

export function CashCollectModal({
  visible,
  orderTotal,
  isSubmitting,
  onConfirm,
  onClose,
}: CashCollectModalProps) {
  const theme = useTheme();
  const [amount, setAmount] = useState(String(orderTotal));

  function handleConfirm() {
    const value = Number(amount);
    if (value > 0) {
      onConfirm(value);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.backdrop}>
        <ThemedView type="backgroundElement" style={styles.modal}>
          <ThemedText type="subtitle">Recaudo en efectivo</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Total a cobrar: {formatCurrency(orderTotal)}
          </ThemedText>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />

          <ThemedView style={styles.actions}>
            <Pressable onPress={onClose} disabled={isSubmitting}>
              <ThemedText type="small" themeColor="textSecondary">
                Cancelar
              </ThemedText>
            </Pressable>
            <Pressable onPress={handleConfirm} disabled={isSubmitting} style={styles.confirm}>
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.confirmText}>
                  Confirmar recaudo
                </ThemedText>
              )}
            </Pressable>
          </ThemedView>
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
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.three,
  },
  confirm: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  confirmText: {
    color: '#ffffff',
  },
});