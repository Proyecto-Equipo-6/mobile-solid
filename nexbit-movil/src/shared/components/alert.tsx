import { StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export type AlertVariant = 'error' | 'success';

export type AlertProps = Readonly<{
  variant?: AlertVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function Alert({
  variant = 'error',
  children,
  style,
}: AlertProps) {
  const theme = useTheme();
  const color = variant === 'error' ? theme.error : theme.success;
  const bg = variant === 'error' ? theme.errorBg : theme.successBg;
  const border = variant === 'error' ? theme.errorBorder : theme.successBorder;

  return (
    <ThemedView style={[styles.base, { backgroundColor: bg, borderColor: border }, style]}>
      <ThemedText type="small" style={{ color }}>
        {children}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.control,
    borderWidth: 1,
  },
});