import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { Alert } from '@/shared/components/alert';
import { BrandMark } from '@/shared/components/brand-mark';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Brand, Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit() {
    if (submittingRef.current) {
      return;
    }
    submittingRef.current = true;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
      setError(msg);
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <ThemedView style={[styles.auth, { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <BrandMark size="large" showName={false} style={styles.logo} />

          <ThemedText type="title" style={styles.titulo}>
            Iniciar sesión
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitulo}>
            Bienvenido de nuevo a {Brand.nombre}
          </ThemedText>

          {error && <Alert variant="error">{error}</Alert>}

          <Field
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            secureTextEntry
            required
          />

          <Button label="Iniciar sesión" fullWidth loading={submitting} onPress={handleSubmit} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.registrate}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register">
              <ThemedText type="link" themeColor="text">
                Regístrate
              </ThemedText>
            </Link>
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  auth: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  titulo: {
    textAlign: 'center',
  },
  subtitulo: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  registrate: {
    textAlign: 'center',
  },
});