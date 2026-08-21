import { Link, useRouter } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { CartItem } from '@/features/cart/components/CartItem';
import { CheckoutSummary } from '@/features/cart/components/CheckoutSummary';
import { useCart } from '@/features/cart/hooks/useCart';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const { items, totals, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Tu carrito está vacío</ThemedText>
        <ThemedText themeColor="textSecondary">Agrega productos desde el catálogo.</ThemedText>
        <Link href="/catalog" asChild>
          <Button label="Ir al catálogo" variant="secondary" pill />
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={() => removeItem(item.productId)}
            onChangeQuantity={(quantity) => updateQuantity(item.productId, quantity)}
          />
        )}
      />
      <ThemedView style={styles.footer}>
        <CheckoutSummary
          totals={totals}
          onCheckout={() => router.push('/checkout')}
        />
      </ThemedView>
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
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  footer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
});