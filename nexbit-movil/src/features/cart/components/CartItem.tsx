import { Pressable, StyleSheet } from 'react-native';

import type { CartItem as CartItemModel } from '@/features/cart/types/cart.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { formatCurrency } from '@/shared/utils/format';

type CartItemProps = {
  item: CartItemModel;
  onRemove: () => void;
  onChangeQuantity: (quantity: number) => void;
};

export function CartItem({ item, onRemove, onChangeQuantity }: CartItemProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedView style={styles.info}>
        <ThemedText type="smallBold">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(item.price)} c/u
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.stepper, { borderColor: theme.border, borderWidth: 1 }]}>
        <Pressable onPress={() => onChangeQuantity(item.quantity - 1)} style={styles.stepButton}>
          <ThemedText type="smallBold">-</ThemedText>
        </Pressable>
        <ThemedText type="smallBold">{item.quantity}</ThemedText>
        <Pressable onPress={() => onChangeQuantity(item.quantity + 1)} style={styles.stepButton}>
          <ThemedText type="smallBold">+</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedText type="smallBold" style={{ color: theme.accent }}>
        {formatCurrency(item.price * item.quantity)}
      </ThemedText>

      <Pressable onPress={onRemove}>
        <ThemedText type="small" themeColor="textSecondary">
          Quitar
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.control,
    overflow: 'hidden',
  },
  stepButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});