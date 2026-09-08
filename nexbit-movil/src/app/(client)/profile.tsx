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
import { mensajeTelefono, validarNombre, validarTelefono } from '@/shared/utils/validacion';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  const [iniciales, setIniciales] = useState<{ nombre: string; telefono: string; direccion: string } | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
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
          setIniciales({
            nombre: perfil.name,
            telefono: perfil.phone ?? '',
            direccion: perfil.direccion ?? '',
          });
        }
      })
      .catch(() => {
        if (active && user) {
          setNombre(user.name);
          setEmail(user.email);
          setTelefono(user.phone ?? '');
          setDireccion(user.direccion ?? '');
          setIniciales({
            nombre: user.name,
            telefono: user.phone ?? '',
            direccion: user.direccion ?? '',
          });
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

  function hayCambios(): boolean {
    if (!iniciales) {
      return true;
    }
    return (
      nombre.trim() !== iniciales.nombre ||
      telefono.trim() !== iniciales.telefono ||
      direccion.trim() !== iniciales.direccion
    );
  }

  function validarCampos(): boolean {
    const nuevos: Record<string, string> = {};
    if (!validarNombre(nombre)) nuevos.nombre = 'El nombre es obligatorio';
    if (!validarTelefono(telefono)) nuevos.telefono = mensajeTelefono();
    if (!validarNombre(direccion)) nuevos.direccion = 'La dirección es obligatoria';
    if (hayCambios() && !password) {
      nuevos.password = 'Ingresa tu contraseña actual para guardar los cambios';
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function handleSave() {
    if (isSaving) {
      return;
    }
    setMessage(null);
    setError(null);
    if (!hayCambios()) {
      setMessage('No hay cambios para guardar.');
      return;
    }
    if (!validarCampos()) {
      return;
    }
    setIsSaving(true);
    try {
      await profileService.updateMyProfile({
        nombre_apellido: nombre,
        telefono,
        direccion,
        password,
      });
      setPassword('');
      setIniciales({ nombre, telefono, direccion });
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

        <Field label="Nombre y apellido" value={nombre} onChangeText={setNombre} placeholder="Nombre completo" error={errores.nombre} />
        <Field label="Correo electrónico" value={email} editable={false} placeholder="correo@ejemplo.com" />
        <Field
          label="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej: 3001234567"
          keyboardType="phone-pad"
          maxLength={10}
          error={errores.telefono}
        />
        <Field
          label="Dirección"
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ej: Calle 10 # 5-20, Medellín"
          error={errores.direccion}
        />

        {hayCambios() && (
          <Field
            label="Contraseña actual"
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña para confirmar los cambios"
            secureTextEntry
            autoCapitalize="none"
            error={errores.password}
          />
        )}

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