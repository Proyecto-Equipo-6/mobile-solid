import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export type ScreenHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function ScreenHeader({
  title,
  subtitle,
  right,
  style,
}: ScreenHeaderProps) {
  return (
    <ThemedView style={[styles.header, style]}>
      <ThemedView style={styles.textos}>
        <ThemedText type="title">{title}</ThemedText>
        {subtitle && (
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        )}
      </ThemedView>
      {right}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textos: {
    flex: 1,
    gap: Spacing.one,
  },
});