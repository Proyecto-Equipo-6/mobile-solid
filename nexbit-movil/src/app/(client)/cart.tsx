import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { CartItem } from '@/features/cart/components/CartItem';
import { CheckoutSummary } from '@/features/cart/components/CheckoutSummary';
import { useCart } from '@/features/cart/hooks/useCart';
import * as orderService from '@/features/cart/services/order.service';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

const PLACEHOLDER_ADDRESS = { address: 'Calle 123 #45-67', city: 'Bogotá' };

export default function CartScreen() {
  const { items, totals, removeItem, updateQuantity, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCheckout() {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      await orderService.createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        deliveryAddress: PLACEHOLDER_ADDRESS,
        paymentMethod: 'cash_on_delivery',
      });
      clear();
      setMessage('Pedido realizado. ¡Paga cuando lo recibas!');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo realizar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Tu carrito está vacío</ThemedText>
        <ThemedText themeColor="textSecondary">
          {message ?? 'Agrega productos desde el catálogo.'}
        </ThemedText>
        <Link href="/catalog">
          <ThemedText type="link">Ir al catálogo</ThemedText>
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
      {isSubmitting && <ActivityIndicator />}
      <CheckoutSummary totals={totals} isSubmitting={isSubmitting} onCheckout={handleCheckout} />
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
});