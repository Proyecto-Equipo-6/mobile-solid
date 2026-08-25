import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type AdminFilterBarProps = {
  activeCount: number;
  inactiveCount: number;
  filter: 'active' | 'inactive';
  onFilterChange: (f: 'active' | 'inactive') => void;
};

export function AdminFilterBar({ activeCount, inactiveCount, filter, onFilterChange }: AdminFilterBarProps) {
  const dash = useDashTheme();

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => onFilterChange('active')}>
        <ThemedView
          style={[
            styles.chip,
            {
              backgroundColor: filter === 'active' ? DashColors.success : 'transparent',
              borderColor: DashColors.success,
              borderWidth: 1,
            },
          ]}>
          <ThemedText
            type="smallBold"
            style={{ color: filter === 'active' ? '#fff' : DashColors.success, fontSize: 13 }}>
            Activos ({activeCount})
          </ThemedText>
        </ThemedView>
      </Pressable>
      <Pressable onPress={() => onFilterChange('inactive')}>
        <ThemedView
          style={[
            styles.chip,
            {
              backgroundColor: filter === 'inactive' ? DashColors.error : 'transparent',
              borderColor: DashColors.error,
              borderWidth: 1,
            },
          ]}>
          <ThemedText
            type="smallBold"
            style={{ color: filter === 'inactive' ? '#fff' : DashColors.error, fontSize: 13 }}>
            Inactivos ({inactiveCount})
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
});
