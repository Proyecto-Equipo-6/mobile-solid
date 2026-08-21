import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import * as profileService from '@/features/auth/services/profile.service';
import { Alert } from '@/shared/components/alert';
import { BrandMark } from '@/shared/components/brand-mark';
import { Button } from '@/shared/components/button';
import { Field } from '@/shared/components/field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Spacing } from '@/shared/constants/theme';
import { useTheme } from '@/shared/hooks/use-theme';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    profileService
      .getMyProfile()
      .then((perfil) => {
        if (active) {
          setNombre(perfil.name);
          setEmail(perfil.email);
          setTelefono(perfil.phone ?? '');
          setDireccion(perfil.direccion ?? '');
        }
      })
      .catch(() => {
        if (active && user) {
          setNombre(user.name);
          setEmail(user.email);
          setTelefono(user.phone ?? '');
          setDireccion(user.direccion ?? '');
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSave() {
    if (isSaving) {
      return;
    }
    setMessage(null);
    setError(null);
    setIsSaving(true);
    try {
      await profileService.updateMyProfile({
        nombre_apellido: nombre,
        telefono,
        direccion,
      });
      setMessage('Perfil actualizado correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BrandMark size="large" showName />

      <ThemedView style={[styles.card, { borderColor: theme.border, borderWidth: 1 }]}>
        <ThemedText type="subtitle">Mi perfil</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Mantén tus datos de contacto y entrega al día.
        </ThemedText>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        <Field label="Nombre y apellido" value={nombre} onChangeText={setNombre} placeholder="Nombre completo" />
        <Field label="Correo electrónico" value={email} editable={false} placeholder="correo@ejemplo.com" />
        <Field
          label="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej: 3001234567"
          keyboardType="phone-pad"
          maxLength={10}
        />
        <Field
          label="Dirección"
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ej: Calle 10 # 5-20, Medellín"
        />

        <Button label="Guardar cambios" fullWidth loading={isSaving || isLoading} onPress={handleSave} />
      </ThemedView>

      <Button label="Cerrar sesión" variant="secondary" onPress={handleSignOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.five,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.card,
  },
});