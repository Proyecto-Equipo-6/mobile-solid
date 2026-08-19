import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';

import { CategoryFilter } from '@/features/catalog/components/CategoryFilter';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import { useCart } from '@/features/cart/hooks/useCart';
import type { Product } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export default function CatalogScreen() {
  const { products, categories, selectedCategory, setSelectedCategory, isLoading, error, reload } =
    useProducts();
  const { addItem } = useCart();

  function handleSelectProduct(product: Product) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  }

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
          <ProductCard product={item} onPress={handleSelectProduct} />
        )}
        ListEmptyComponent={
          <ThemedText themeColor="textSecondary">No hay productos disponibles.</ThemedText>
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
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
});