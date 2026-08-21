import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, ThemeColor } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { ThemedText } from '@/shared/components/themed-text';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  pill?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  label?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  variant = 'primary',
  pill,
  fullWidth,
  loading,
  label,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    pill && styles.pill,
    fullWidth && styles.fullWidth,
    variant === 'primary' && { backgroundColor: theme.accent },
    variant === 'secondary' && {
      backgroundColor: theme.background,
      borderColor: theme.border,
    },
    variant === 'danger' && {
      backgroundColor: theme.errorBg,
      borderColor: theme.errorBorder,
    },
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor: ThemeColor = variant === 'danger' ? 'error' : 'sobreAccent';

  return (
    <Pressable disabled={disabled || loading} style={containerStyle} {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.text : theme.sobreAccent} />
      ) : label ? (
        <ThemedText
          type="smallBold"
          themeColor={variant === 'secondary' ? 'text' : textColor}
          style={styles.label}>
          {label}
        </ThemedText>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pill: {
    borderRadius: Radius.pill,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    textAlign: 'center',
  },
});