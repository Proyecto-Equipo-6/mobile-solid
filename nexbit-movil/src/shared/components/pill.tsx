import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius } from '@/shared/constants/theme';

export const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#0284c7',
  assigned: '#7c3aed',
  in_transit: '#0e7490',
  delivered: '#16a34a',
  not_delivered: '#dc2626',
  cancelled: '#6b7280',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  assigned: 'Asignado',
  in_transit: 'En camino',
  delivered: 'Entregado',
  not_delivered: 'No entregado',
  cancelled: 'Cancelado',
};

export type PillProps = Readonly<{
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Pill({
  label,
  color,
  style,
}: PillProps) {
  const c = color ?? '#6b7280';
  const bg = hexToRgba(c, 0.1);

  return (
    <ThemedView style={[styles.pill, { backgroundColor: bg, borderColor: `${c}40` }, style]}>
      <ThemedView style={[styles.dot, { backgroundColor: c }]} />
      <ThemedText type="smallBold" style={{ color: c, fontSize: 12 }}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = Number.parseInt(value.substring(0, 2), 16);
  const g = Number.parseInt(value.substring(2, 4), 16);
  const b = Number.parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 50,
  },
});