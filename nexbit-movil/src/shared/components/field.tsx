import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export type FieldProps = TextInputProps & {
  label?: string;
  required?: boolean;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, required, error, containerStyle, style, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText type="smallBold" style={styles.label}>
          {label}
          {required && <ThemedText themeColor="error" style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
      <TextInput
        ref={ref}
        style={[
          styles.control,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.error : theme.border,
          },
          style,
        ]}
        placeholderTextColor={theme.textMuted}
        {...rest}
      />
      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
  },
  required: {
    fontWeight: '700',
  },
  control: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderRadius: Radius.control,
    borderWidth: 1,
    fontSize: 15,
  },
});