import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import type { Product } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/format';

type ProductCardProps = {
  product: Product;
  onPress?: (product: Product) => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <Pressable onPress={onPress ? () => onPress(product) : undefined}>
      <ThemedView type="backgroundElement" style={styles.card}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.imagePlaceholder}>
            <ThemedText type="small" themeColor="textSecondary">
              Sin imagen
            </ThemedText>
          </ThemedView>
        )}
        <ThemedText type="smallBold">{product.name}</ThemedText>
        <ThemedText type="default">{formatCurrency(product.price)}</ThemedText>
        {!product.available && (
          <ThemedText type="small" themeColor="textSecondary">
            Agotado
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});