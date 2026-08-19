import { Pressable, StyleSheet } from 'react-native';

import type { CartItem as CartItemModel } from '@/features/cart/types/cart.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/format';

type CartItemProps = {
  item: CartItemModel;
  onRemove: () => void;
  onChangeQuantity: (quantity: number) => void;
};

export function CartItem({ item, onRemove, onChangeQuantity }: CartItemProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedView style={styles.info}>
        <ThemedText type="smallBold">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatCurrency(item.price)} c/u
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundSelected" style={styles.stepper}>
        <Pressable onPress={() => onChangeQuantity(item.quantity - 1)} style={styles.stepButton}>
          <ThemedText type="smallBold">-</ThemedText>
        </Pressable>
        <ThemedText type="smallBold">{item.quantity}</ThemedText>
        <Pressable onPress={() => onChangeQuantity(item.quantity + 1)} style={styles.stepButton}>
          <ThemedText type="smallBold">+</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedText type="smallBold">{formatCurrency(item.price * item.quantity)}</ThemedText>

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
    borderRadius: Spacing.three,
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  stepButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
});