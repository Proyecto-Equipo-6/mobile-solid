import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import type { CartTotals } from '@/features/cart/types/cart.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/format';

type CheckoutSummaryProps = {
  totals: CartTotals;
  isSubmitting?: boolean;
  onCheckout: () => void;
};

export function CheckoutSummary({ totals, isSubmitting, onCheckout }: CheckoutSummaryProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
      <SummaryRow label="Domicilio" value={formatCurrency(totals.deliveryFee)} />
      <SummaryRow label="Total" value={formatCurrency(totals.total)} strong />

      <Pressable onPress={onCheckout} disabled={isSubmitting} style={styles.button}>
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText type="smallBold" style={styles.buttonText}>
            Pedir contra entrega
          </ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <ThemedView style={styles.row}>
      <ThemedText type={strong ? 'smallBold' : 'small'} themeColor={strong ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={strong ? 'smallBold' : 'small'}>{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: Spacing.two,
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
});