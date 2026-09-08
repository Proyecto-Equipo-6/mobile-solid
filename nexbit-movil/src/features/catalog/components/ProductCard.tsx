import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useCart } from '@/features/cart/hooks/useCart';
import type { Product } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing, Shadows } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

type ProductCardProps = Readonly<{
  product: Product;
  categoryName?: string;
}>;

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Pressable onPress={() => router.push(`/product/${product.id}`)} style={({ pressed }) => [pressed && styles.pressed]}>
      <ThemedView style={[styles.card, { borderColor: theme.border }]}>
        <ThemedView style={styles.imagenContainer}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.imagen} contentFit="cover" />
          ) : (
            <ThemedView style={styles.imagenVacia}>
              <ThemedText type="smallBold" themeColor="textMuted">
                Nexbit
              </ThemedText>
            </ThemedView>
          )}
          {categoryName && (
            <ThemedView style={[styles.categoria, { backgroundColor: theme.accent }]}>
              <ThemedText type="smallBold" style={{ color: theme.sobreAccent, fontSize: 11 }}>
                {categoryName}
              </ThemedText>
            </ThemedView>
          )}
          {!product.available && (
            <ThemedView style={[styles.agotado, { backgroundColor: theme.errorBg, borderColor: theme.errorBorder }]}>
              <ThemedText type="smallBold" themeColor="error" style={{ fontSize: 11 }}>
                No disponible
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <ThemedView style={styles.cuerpo}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {product.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {product.description}
          </ThemedText>
          <ThemedText type="smallBold" style={[styles.precio, { color: theme.accent }]}>
            {formatCurrency(product.price)}
          </ThemedText>

          {added && (
            <ThemedText type="smallBold" themeColor="success" style={styles.aviso}>
              ✓ Agregado al carrito
            </ThemedText>
          )}

          <ThemedView style={styles.acciones}>
            <Pressable
              onPress={() => router.push(`/product/${product.id}`)}
              style={({ pressed }) => [styles.boton, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, pressed && styles.pressed]}>
              <ThemedText type="smallBold" themeColor="text">
                Ver
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={!product.available}
              style={({ pressed }) => [styles.boton, styles.botonAgregar, { backgroundColor: theme.accent }, (!product.available || pressed) && styles.pressed]}>
              <ThemedText type="smallBold" style={{ color: theme.sobreAccent }}>
                {added ? '✓' : 'Añadir'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    flex: 1,
    borderRadius: Radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  imagenContainer: {
    aspectRatio: 16 / 10,
    backgroundColor: '#f5f5f6',
    position: 'relative',
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
  categoria: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
  },
  agotado: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  cuerpo: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  precio: {
    fontSize: 18,
    fontWeight: '700',
  },
  aviso: {
    fontSize: 12,
  },
  acciones: {
    marginTop: Spacing.one,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  boton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  botonAgregar: {
    borderColor: 'transparent',
  },
});