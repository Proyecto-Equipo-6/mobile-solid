import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

import type { CreateProductPayload } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type ProductFormProps = {
  onSubmit: (payload: CreateProductPayload) => Promise<unknown>;
  onCancel: () => void;
};

export function ProductForm({ onSubmit, onCancel }: ProductFormProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting || !name || !price) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        price: Number(price),
        categoryId,
        available: true,
      });
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.backgroundElement }];

  return (
    <ThemedView type="backgroundElement" style={styles.form}>
      <ThemedText type="smallBold">Nuevo producto</ThemedText>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
        placeholderTextColor={theme.textSecondary}
        style={inputStyle}
      />
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Precio (COP)"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
        style={inputStyle}
      />
      <TextInput
        value={categoryId}
        onChangeText={setCategoryId}
        placeholder="ID de categoría"
        placeholderTextColor={theme.textSecondary}
        style={inputStyle}
      />

      <ThemedView style={styles.actions}>
        <Pressable onPress={onCancel} disabled={isSubmitting}>
          <ThemedText type="small" themeColor="textSecondary">
            Cancelar
          </ThemedText>
        </Pressable>
        <Pressable onPress={handleSubmit} disabled={isSubmitting} style={styles.submit}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText type="smallBold" style={styles.submitText}>
              Guardar
            </ThemedText>
          )}
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  submit: {
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  submitText: {
    color: '#ffffff',
  },
});