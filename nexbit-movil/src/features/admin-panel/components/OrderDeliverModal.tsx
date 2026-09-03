import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Radius, Shadows, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';

type OrderDeliverModalProps = Readonly<{
  visible: boolean;
  orderId: string;
  onClose: () => void;
  onDeliver: (imagen: { uri: string; mimeType: string; base64?: string }, observacion?: string) => Promise<void>;
  isLoading: boolean;
}>;

export function OrderDeliverModal({ visible, orderId, onClose, onDeliver, isLoading }: OrderDeliverModalProps) {
  const dash = useDashTheme();
  const [imagen, setImagen] = useState<{ uri: string; mimeType: string; base64?: string } | null>(null);
  const [observacion, setObservacion] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  if (!visible) return null;

  const pickImage = async () => {
    setIsPicking(true);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la galería para seleccionar la foto del comprobante.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: Platform.OS === 'web',
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setImagen({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          base64: asset.base64 ?? undefined,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setIsPicking(false);
    }
  };

  const handleDeliver = async () => {
    if (!imagen) {
      Alert.alert('Comprobante requerido', 'Debes seleccionar una foto del comprobante de entrega');
      return;
    }

    try {
      await onDeliver(imagen, observacion || undefined);
      setImagen(null);
      setObservacion('');
      onClose();
    } catch (error) {
      console.error('Error delivering order:', error);
      // Error is handled by the caller
    }
  };

  const removeImage = () => {
    setImagen(null);
  };

  return (
    <ThemedView style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]} onTouchStart={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
        keyboardVerticalOffset={100}
      >
        <ThemedView style={[styles.modal, { backgroundColor: dash.card, borderColor: dash.border }]} onTouchStart={(e) => e.stopPropagation()}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle" style={{ color: dash.text }}>
              Confirmar entrega
            </ThemedText>
            <Pressable onPress={onClose} disabled={isLoading}>
              <ThemedText type="title" style={{ color: dash.textSecondary }}>
                ✕
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <ThemedText type="small" style={{ color: dash.textSecondary, marginBottom: Spacing.three }}>
              Pedido <ThemedText type="smallBold">{orderId}</ThemedText>
            </ThemedText>

            <ThemedText type="smallBold" style={{ color: dash.text, marginBottom: Spacing.two }}>
              Foto del comprobante de entrega
            </ThemedText>

            {!imagen ? (
              <Pressable onPress={pickImage} disabled={isLoading || isPicking} style={styles.imagePlaceholder}>
                <ThemedView style={styles.placeholderContent}>
                  <ThemedText type="title" style={{ color: dash.textSecondary }}>📷</ThemedText>
                  <ThemedText type="small" style={{ color: dash.textSecondary, marginTop: Spacing.two }}>
                    Toca para seleccionar la foto
                  </ThemedText>
                  <ThemedText type="small" style={{ color: dash.textMuted, marginTop: Spacing.one }}>
                    JPG/PNG · Máx 5MB
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ) : (
              <ThemedView style={styles.imagePreview}>
                <ThemedView style={styles.imageContainer}>
                  <ThemedView
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: Radius.card,
                      overflow: 'hidden',
                    }}
                  >
                    {Platform.OS === 'web' && imagen.base64 ? (
                      <img src={`data:${imagen.mimeType};base64,${imagen.base64}`} alt="Comprobante de entrega" style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <ThemedView style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0' }}>
                        <ThemedText style={{ color: dash.textSecondary, textAlign: 'center', marginTop: '40%' }}>
                          Vista previa
                        </ThemedText>
                      </ThemedView>
                    )}
                  </ThemedView>
                </ThemedView>
                <Pressable onPress={removeImage} style={styles.removeButton} disabled={isLoading}>
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>✕ Quitar</ThemedText>
                </Pressable>
              </ThemedView>
            )}

            <ThemedView style={styles.observacionContainer}>
              <ThemedText type="smallBold" style={{ color: dash.text, marginBottom: Spacing.one }}>
                Observación (opcional)
              </ThemedText>
              <ThemedView style={styles.inputWrapper}>
                <ThemedText
                  type="small"
                  style={{ color: dash.text }}
                >
                  {observacion || 'Sin observaciones'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ScrollView>

          <ThemedView style={styles.footer}>
            <Pressable
              onPress={onClose}
              disabled={isLoading}
              style={[styles.buttonSecondary, { backgroundColor: dash.border }]}
            >
              <ThemedText type="smallBold" style={{ color: dash.text }}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleDeliver}
              disabled={isLoading || !imagen || isPicking}
              style={[
                styles.buttonPrimary,
                { backgroundColor: !imagen || isLoading ? dash.textMuted : dash.accent },
              ]}
            >
              <ThemedText type="smallBold" style={{ color: dash.sobreAccent }}>
                {isLoading ? 'Confirmando…' : 'Confirmar entrega'}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
  },
  modal: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    ...Shadows.card,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  content: {
    maxHeight: 400,
  },
  contentInner: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Radius.card,
    padding: Spacing.four,
    alignItems: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.two,
    right: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
  observacionContainer: {
    gap: Spacing.one,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: Radius.control,
    padding: Spacing.three,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Radius.control,
    alignItems: 'center',
  },
  buttonPrimary: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: Radius.control,
    alignItems: 'center',
  },
});