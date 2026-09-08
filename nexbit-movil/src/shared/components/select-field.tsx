import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = Readonly<{
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
}>;

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona…',
  error,
  loading,
  disabled,
}: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText type="smallBold" style={styles.label}>
          {label}
        </ThemedText>
        <Pressable
          onPress={() => setOpen(true)}
          disabled={disabled || loading}
          style={[
            styles.control,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: error ? theme.error : theme.border,
            },
          ]}>
          <ThemedText type="small" themeColor={selected ? 'text' : 'textMuted'}>
            {loading ? 'Cargando…' : selected ? selected.label : placeholder}
          </ThemedText>
        </Pressable>
        {error && (
          <ThemedText type="small" themeColor="error">
            {error}
          </ThemedText>
        )}
      </ThemedView>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <ThemedView style={[styles.content, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ThemedText type="smallBold" style={styles.contentTitle}>
              {label}
            </ThemedText>
            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}>
                    <ThemedView
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected ? theme.accentBg : 'transparent',
                          borderColor: isSelected ? theme.accent : 'transparent',
                        },
                      ]}>
                      <ThemedText type="small" themeColor={isSelected ? 'accent' : 'text'}>
                        {item.label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <ThemedView style={styles.vacio}>
                  <ThemedText type="small" themeColor="textMuted">
                    Sin opciones disponibles.
                  </ThemedText>
                </ThemedView>
              }
            />
            <Pressable onPress={() => setOpen(false)} style={styles.cerrar}>
              <ThemedText type="link" themeColor="textSecondary">
                Cerrar
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 13,
  },
  control: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    borderRadius: Radius.control,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  content: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: Spacing.three,
    maxHeight: '70%',
    gap: Spacing.two,
  },
  contentTitle: {
    fontSize: 16,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.control,
    borderWidth: 1,
    marginBottom: Spacing.one,
  },
  vacio: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  cerrar: {
    alignSelf: 'flex-end',
    padding: Spacing.one,
  },
});