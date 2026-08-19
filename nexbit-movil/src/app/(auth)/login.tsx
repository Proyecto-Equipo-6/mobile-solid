import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Nexbit</ThemedText>
        <ThemedText themeColor="textSecondary">Inicia sesión para continuar</ThemedText>
      </ThemedView>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        style={inputStyle}
      />

      {error && (
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      )}

      <Pressable onPress={handleSubmit} disabled={submitting} style={styles.submit}>
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText type="smallBold" style={styles.submitText}>
            Ingresar
          </ThemedText>
        )}
      </Pressable>

      <Link href="/register">
        <ThemedText type="link">¿No tienes cuenta? Regístrate</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  submit: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitText: {
    color: '#ffffff',
  },
});