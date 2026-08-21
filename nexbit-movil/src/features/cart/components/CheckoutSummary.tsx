import { StyleSheet } from 'react-native';

import type { CartTotals } from '@/features/cart/types/cart.types';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

type CheckoutSummaryProps = {
  totals: CartTotals;
  isSubmitting?: boolean;
  onCheckout: () => void;
};

export function CheckoutSummary({ totals, isSubmitting, onCheckout }: CheckoutSummaryProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderColor: theme.border, borderWidth: 1 }]}>
      <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
      <SummaryRow label="Domicilio" value={formatCurrency(totals.deliveryFee)} />
      <ThemedView style={[styles.divider, { backgroundColor: theme.border }]} />
      <SummaryRow label="Total" value={formatCurrency(totals.total)} strong />

      <Button label="Pedir contra entrega" fullWidth loading={isSubmitting} onPress={onCheckout} />
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
    borderRadius: Radius.card,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
});