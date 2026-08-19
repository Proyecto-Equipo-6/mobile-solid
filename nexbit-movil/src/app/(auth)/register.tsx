import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) {
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, phone });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Registro</ThemedText>
        <ThemedText themeColor="textSecondary">Crea tu cuenta de cliente</ThemedText>
      </ThemedView>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre completo"
        placeholderTextColor={theme.textSecondary}
        style={inputStyle}
      />
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
        value={phone}
        onChangeText={setPhone}
        placeholder="Teléfono"
        placeholderTextColor={theme.textSecondary}
        keyboardType="phone-pad"
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
            Crear cuenta
          </ThemedText>
        )}
      </Pressable>

      <Link href="/login">
        <ThemedText type="link">¿Ya tienes cuenta? Inicia sesión</ThemedText>
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