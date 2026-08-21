import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Brand, Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

type BrandMarkProps = ViewProps & {
  size?: 'small' | 'large';
  showName?: boolean;
};

export function BrandMark({ size = 'small', showName = true, style }: BrandMarkProps) {
  const theme = useTheme();
  const isLarge = size === 'large';
  const box = isLarge ? styles.boxLarge : styles.boxSmall;

  return (
    <View style={[styles.container, style]}>
      <View style={[box, { backgroundColor: theme.accent }]}>
        <Text
          style={[
            styles.logo,
            isLarge ? styles.logoLarge : styles.logoSmall,
            { color: theme.sobreAccent },
          ]}>
          {Brand.logotipo}
        </Text>
      </View>
      {showName && (
        <Text style={[styles.nombre, { color: theme.text }]}>{Brand.nombre}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  boxSmall: {
    width: 34,
    height: 34,
    borderRadius: Radius.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLarge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoSmall: {
    fontSize: 13,
  },
  logoLarge: {
    fontSize: 16,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
  },
});