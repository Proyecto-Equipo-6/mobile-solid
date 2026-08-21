import { Link } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/shared/components/brand-mark';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.four }]}>
        <BrandMark size="large" showName />

        <ThemedView style={styles.bienvenida}>
          <ThemedView style={[styles.etiqueta, { backgroundColor: theme.accentBg }]}>
            <ThemedText type="smallBold" style={{ color: theme.accent, fontSize: 12 }}>
              Cliente
            </ThemedText>
          </ThemedView>
          <ThemedText type="title">Hola, {user?.name ?? 'cliente'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Encuentra tus productos favoritos y paga contra entrega. Tu perfil siempre está disponible.
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.panel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <ThemedText type="subtitle">¿Nuevo por aquí?</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Explora nuestro catálogo de productos verificados. Compra fácil, paga como prefieras y
            recibe tu pedido con entrega segura en todo el país.
          </ThemedText>
          <Link href="/catalog" asChild>
            <Button label="Explorar catálogo" pill />
          </Link>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  bienvenida: {
    gap: Spacing.two,
  },
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    marginBottom: Spacing.one,
  },
  panel: {
    padding: Spacing.four,
    gap: Spacing.three,
    borderRadius: Radius.container,
    borderWidth: 1,
  },
});