import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TipoDocumento } from '@/features/auth/types/auth.types';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

const TIPOS_DOCUMENTO: TipoDocumento[] = ['CC', 'Pasaporte', 'CE', 'Otro'];

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { register } = useAuth();
  const [nombreApellido, setNombreApellido] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('CC');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
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
      await register({
        nombre_apellido: nombreApellido,
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        email,
        password,
        telefono,
        direccion,
      });
      router.replace('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { color: theme.text, borderColor: theme.backgroundElement }];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Registro</ThemedText>
          <ThemedText themeColor="textSecondary">Crea tu cuenta de cliente</ThemedText>
        </ThemedView>

        <TextInput
          value={nombreApellido}
          onChangeText={setNombreApellido}
          placeholder="Nombre y apellido"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />

        <ThemedText type="small" themeColor="textSecondary">
          Tipo de documento
        </ThemedText>
        <ThemedView style={styles.chipRow}>
          {TIPOS_DOCUMENTO.map((tipo) => {
            const selected = tipoDocumento === tipo;
            return (
              <Pressable key={tipo} onPress={() => setTipoDocumento(tipo)}>
                <ThemedView type={selected ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
                  <ThemedText type="smallBold">{tipo}</ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </ThemedView>

        <TextInput
          value={numeroDocumento}
          onChangeText={setNumeroDocumento}
          placeholder="Número de documento"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
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
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Teléfono (10 dígitos)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="phone-pad"
          maxLength={10}
          style={inputStyle}
        />
        <TextInput
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Dirección"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña (4 a 8 caracteres)"
          placeholderTextColor={theme.textSecondary}
          secureTextEntry
          maxLength={8}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  submit: {
    backgroundColor: '#208AEF',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  submitText: {
    color: '#ffffff',
  },
});