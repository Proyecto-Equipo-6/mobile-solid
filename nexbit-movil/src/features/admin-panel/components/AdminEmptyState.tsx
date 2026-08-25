import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type AdminEmptyStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AdminEmptyState({ message, actionLabel, onAction }: AdminEmptyStateProps) {
  const dash = useDashTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" style={{ color: dash.textSecondary, textAlign: 'center' }}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <ThemedText type="small" style={{ color: DashColors.accent, textAlign: 'center', marginTop: Spacing.two }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
