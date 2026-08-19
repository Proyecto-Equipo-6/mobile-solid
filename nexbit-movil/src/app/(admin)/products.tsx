import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { ProductForm } from '@/features/admin-panel/components/ProductForm';
import { useAdminInventory } from '@/features/admin-panel/hooks/useAdminInventory';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/format';

export default function ProductsScreen() {
  const { products, summary, isLoading, error, addProduct, removeProduct, reload } =
    useAdminInventory();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable onPress={reload}>
          <ThemedText type="link">Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Inventario</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {summary?.totalProducts ?? 0} productos
        </ThemedText>
      </ThemedView>

      {showForm && (
        <ProductForm
          onSubmit={addProduct}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Pressable onPress={() => setShowForm((value) => !value)} style={styles.addButton}>
        <ThemedText type="smallBold" style={styles.addButtonText}>
          {showForm ? 'Ocultar formulario' : 'Nuevo producto'}
        </ThemedText>
      </Pressable>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView type="backgroundElement" style={styles.productRow}>
            <ThemedView style={styles.productInfo}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatCurrency(item.price)}
              </ThemedText>
            </ThemedView>
            <Pressable onPress={() => removeProduct(item.id)}>
              <ThemedText type="small" themeColor="textSecondary">
                Eliminar
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  header: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  addButton: {
    marginHorizontal: Spacing.three,
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
  },
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  productInfo: {
    flex: 1,
    gap: Spacing.half,
  },
});