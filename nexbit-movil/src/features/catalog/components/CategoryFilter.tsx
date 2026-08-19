import { Pressable, ScrollView, StyleSheet } from 'react-native';

import type { Category } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory?: string;
  onSelect: (categoryId?: string) => void;
};

export function CategoryFilter({ categories, selectedCategory, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip label="Todos" selected={!selectedCategory} onPress={() => onSelect(undefined)} />
      {categories.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          selected={selectedCategory === category.id}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
        <ThemedText type="smallBold">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
});