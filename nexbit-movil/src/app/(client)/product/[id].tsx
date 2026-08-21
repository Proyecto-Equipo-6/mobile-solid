import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProduct } from '@/features/catalog/services/catalog.service';
import type { Product } from '@/features/catalog/types/catalog.types';
import { useCart } from '@/features/cart/hooks/useCart';
import { Alert } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing, Shadows } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let active = true;
    getProduct(id)
      .then((data) => {
        if (active) {
          setProduct(data);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar el producto');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  function handleAdd() {
    if (!product) {
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="textSecondary">{error ?? 'Producto no encontrado'}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.four }}>
        <ThemedView style={[styles.imagenContainer, { borderColor: theme.border }]}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.imagen} resizeMode="cover" />
          ) : (
            <ThemedView style={styles.imagenVacia}>
              <ThemedText type="smallBold" themeColor="textMuted">
                Nexbit
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.cuerpo}>
          <ThemedText type="subtitle">{product.name}</ThemedText>
          {product.available ? (
            <ThemedText type="smallBold" themeColor="success">
              Disponible
            </ThemedText>
          ) : (
            <ThemedText type="smallBold" themeColor="error">
              No disponible
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {product.description}
          </ThemedText>
          <ThemedText type="title" style={{ color: theme.accent }}>
            {formatCurrency(product.price)}
          </ThemedText>

          {added && <Alert variant="success">Producto agregado al carrito.</Alert>}

          <Button
            label="Agregar al carrito"
            fullWidth
            disabled={!product.available}
            onPress={handleAdd}
          />
        </ThemedView>
      </ScrollView>
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
    padding: Spacing.four,
  },
  imagenContainer: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#f5f5f6',
    borderBottomWidth: 1,
    ...Shadows.subtle,
  },
  imagen: {
    width: '100%',
    height: '100%',
  },
  imagenVacia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
});