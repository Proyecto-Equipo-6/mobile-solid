import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TipoDocumento } from '@/features/auth/types/auth.types';
import { Alert } from '@/shared/components/alert';
import { BrandMark } from '@/shared/components/brand-mark';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Brand, Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

const TIPOS_DOCUMENTO: TipoDocumento[] = ['CC', 'Pasaporte', 'CE', 'Otro'];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  return (
    <ThemedView style={[styles.auth, { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <BrandMark size="large" showName={false} style={styles.logo} />

          <ThemedText type="title" style={styles.titulo}>
            Crear cuenta
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitulo}>
            Únete a {Brand.nombre} y comienza a realizar pedidos
          </ThemedText>

          {error && <Alert variant="error">{error}</Alert>}

          <Field
            label="Nombre y apellido"
            value={nombreApellido}
            onChangeText={setNombreApellido}
            placeholder="Ej: Juan Pérez"
            required
          />

          <ThemedText type="smallBold" style={styles.campoEtiqueta}>
            Tipo de documento
            <ThemedText themeColor="error"> *</ThemedText>
          </ThemedText>
          <ThemedView style={styles.chipRow}>
            {TIPOS_DOCUMENTO.map((tipo) => {
              const selected = tipoDocumento === tipo;
              return (
                <Pressable key={tipo} onPress={() => setTipoDocumento(tipo)}>
                  <ThemedView
                    style={[styles.chip, { backgroundColor: selected ? theme.accent : theme.backgroundElement, borderWidth: 1, borderColor: selected ? theme.accent : theme.border }]}>
                    <ThemedText type="smallBold" style={{ color: selected ? theme.sobreAccent : theme.text }}>
                      {tipo}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </ThemedView>

          <Field
            label="Número de documento"
            value={numeroDocumento}
            onChangeText={setNumeroDocumento}
            placeholder="Ej: 1010123456"
            keyboardType="numeric"
            required
          />
          <Field
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />
          <Field
            label="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej: 3001234567"
            keyboardType="phone-pad"
            maxLength={10}
            required
          />
          <Field
            label="Dirección"
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Ej: Calle 10 # 5-20, Medellín"
            required
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Entre 4 y 8 caracteres"
            secureTextEntry
            maxLength={8}
            required
          />

          <Button label="Crear cuenta" fullWidth loading={submitting} onPress={handleSubmit} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.ingresar}>
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login">
              <ThemedText type="link" themeColor="text">
                Inicia sesión
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
  campoEtiqueta: {
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  ingresar: {
    textAlign: 'center',
  },
});