import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { CategoryFilter } from '@/features/catalog/components/CategoryFilter';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export default function CatalogScreen() {
  const { products, categories, selectedCategory, setSelectedCategory, isLoading, error, reload } =
    useProducts();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

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
      <ThemedView style={styles.cabecera}>
        <ThemedText type="subtitle">Nuestro catálogo</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Productos disponibles con stock real y garantía incluida.
        </ThemedText>
      </ThemedView>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <ProductCard
              product={item}
              categoryName={item.categoryName ?? categoryNameById.get(item.categoryId ?? '')}
            />
          </View>
        )}
        ListEmptyComponent={
          <ThemedView style={styles.vacio}>
            <ThemedText themeColor="textSecondary">No hay productos disponibles.</ThemedText>
          </ThemedView>
        }
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
  cabecera: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  cell: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.five,
  },
  vacio: {
    padding: Spacing.four,
    alignItems: 'center',
  },
});