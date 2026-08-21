import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';
import * as orderService from '@/features/cart/services/order.service';
import { Alert } from '@/shared/components/alert';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

export default function CheckoutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { items, totals, clear } = useCart();

  const [address, setAddress] = useState(user?.direccion ?? '');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (isSubmitting) {
      return;
    }
    if (!address.trim() || !city.trim()) {
      setError('Ingresa la dirección y la ciudad de entrega.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await orderService.createOrder(
        {
          direccionEntrega: `${address.trim()}, ${city.trim()}`,
          observaciones: notes.trim(),
          idMetodoPago: 1,
        },
        items,
      );
      clear();
      router.replace('/orders');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo realizar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">No hay productos</ThemedText>
        <ThemedText themeColor="textSecondary">Tu carrito está vacío.</ThemedText>
        <Button label="Ir al catálogo" variant="secondary" onPress={() => router.replace('/catalog')} />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.seccion}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            DIRECCIÓN DE ENTREGA
          </ThemedText>
          {error && <Alert variant="error">{error}</Alert>}
          <Field
            label="Dirección"
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Calle 10 # 5-20"
            required
          />
          <Field
            label="Ciudad"
            value={city}
            onChangeText={setCity}
            placeholder="Ej: Medellín"
            required
          />
          <Field
            label="Notas (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Piso, edificio, referencias…"
            multiline
          />
        </ThemedView>

        <ThemedView style={styles.seccion}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            MÉTODO DE PAGO
          </ThemedText>
          <ThemedView
            style={[styles.metodo, { borderColor: theme.accent, borderWidth: 1, backgroundColor: theme.accentBg }]}>
            <ThemedText type="smallBold">Pago contra entrega</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Pagas en efectivo cuando recibas tu pedido.
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.seccion}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            RESUMEN
          </ThemedText>
          {items.map((item) => (
            <ThemedView key={item.productId} style={styles.itemResumen}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.itemNombre}>
                {item.quantity} × {item.name}
              </ThemedText>
              <ThemedText type="small">{formatCurrency(item.price * item.quantity)}</ThemedText>
            </ThemedView>
          ))}
          <ThemedView style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedView style={styles.itemResumen}>
            <ThemedText type="small" themeColor="textSecondary">Subtotal</ThemedText>
            <ThemedText type="small">{formatCurrency(totals.subtotal)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.itemResumen}>
            <ThemedText type="small" themeColor="textSecondary">Domicilio</ThemedText>
            <ThemedText type="small">{formatCurrency(totals.deliveryFee)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.itemResumen}>
            <ThemedText type="smallBold">Total</ThemedText>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              {formatCurrency(totals.total)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <Button label="Confirmar pedido" fullWidth loading={isSubmitting} onPress={handleConfirm} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  seccion: {
    gap: Spacing.two,
  },
  metodo: {
    padding: Spacing.three,
    borderRadius: Radius.control,
    gap: Spacing.one,
  },
  itemResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  itemNombre: {
    flex: 1,
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
});