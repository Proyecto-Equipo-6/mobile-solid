import { Pressable, ScrollView, StyleSheet } from 'react-native';

import type { Category } from '@/features/catalog/types/catalog.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type CategoryFilterProps = Readonly<{
  categories: Category[];
  selectedCategory?: string;
  onSelect: (categoryId?: string) => void;
}>;

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
}: Readonly<{
  label: string;
  selected: boolean;
  onPress: () => void;
}>) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <ThemedView
        style={[
          styles.chip,
          {
            backgroundColor: selected ? theme.accent : theme.backgroundElement,
            borderColor: selected ? theme.accent : theme.border,
            borderWidth: 1,
          },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: selected ? theme.sobreAccent : theme.textSecondary }}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
});