import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type AdminCrudModalProps = Readonly<{
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}>;

export function AdminCrudModal({ visible, title, onClose, children }: AdminCrudModalProps) {
  const dash = useDashTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView style={[styles.content, { backgroundColor: dash.card, borderColor: dash.border }]}>
          <ThemedText type="smallBold" style={[styles.title, { color: dash.text }]}>
            {title}
          </ThemedText>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    padding: Spacing.three,
  },
  content: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing.three,
    maxHeight: '85%',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: Spacing.two,
  },
  scroll: {
    flexGrow: 0,
  },
});
