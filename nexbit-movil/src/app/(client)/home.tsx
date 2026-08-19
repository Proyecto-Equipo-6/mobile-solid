import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Hola, {user?.name ?? 'cliente'}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Encuentra tus productos favoritos y paga contra entrega.
        </ThemedText>

        <Link href="/catalog" asChild>
          <Pressable style={styles.button}>
            <ThemedText type="smallBold" style={styles.buttonText}>
              Ver catálogo
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  button: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#ffffff',
  },
});