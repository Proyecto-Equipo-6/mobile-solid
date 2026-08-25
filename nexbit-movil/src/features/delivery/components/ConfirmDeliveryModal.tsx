import { useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, TextInput } from 'react-native';

import {
  entregarPedido,
  marcarNoEntregado,
  subirComprobante,
} from '@/features/delivery/services/delivery.service';
import type { DeliveryOrder } from '@/features/delivery/types/delivery.types';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatCurrency } from '@/shared/utils/format';
import { pickImage, type PickedImage } from '@/shared/utils/imagePicker';

const MAX_TAMANO_FOTO = 3 * 1024 * 1024;

type ConfirmDeliveryModalProps = Readonly<{
  visible: boolean;
  order: DeliveryOrder | null;
  onClose: () => void;
  onDone: () => void;
}>;

type Modo = 'entregado' | 'no_entregado';

function OrderInfo({ order }: Readonly<{ order: DeliveryOrder }>) {
  const dash = useDashTheme();
  return (
    <ThemedView style={styles.datos}>
      <ThemedText type="smallBold" style={{ color: dash.text }}>
        {order.customerName}
      </ThemedText>
      <ThemedText type="small" style={{ color: dash.textSecondary }}>
        {order.address}
      </ThemedText>
      {order.customerPhone && (
        <ThemedText type="small" style={{ color: dash.textSecondary }}>
          {order.customerPhone}
        </ThemedText>
      )}
      <ThemedText type="smallBold" style={{ color: dash.text }}>
        Total a cobrar: {formatCurrency(order.total)}
      </ThemedText>
    </ThemedView>
  );
}

function ModoSelector({ modo, onSelect }: Readonly<{ modo: Modo; onSelect: (m: Modo) => void }>) {
  const dash = useDashTheme();
  const options: { value: Modo; label: string }[] = [
    { value: 'entregado', label: 'Entregado' },
    { value: 'no_entregado', label: 'No entregado' },
  ];
  return (
    <ThemedView style={styles.modoRow}>
      {options.map((opt) => (
        <Pressable key={opt.value} onPress={() => onSelect(opt.value)}>
          <ThemedView
            style={[
              styles.modoChip,
              { backgroundColor: modo === opt.value ? dash.accent : dash.cardHover, borderColor: dash.border },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: modo === opt.value ? dash.sobreAccent : dash.textSecondary }}>
              {opt.label}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ThemedView>
  );
}

function ComprobanteSection({
  imagen,
  isUploading,
  comprobanteUrl,
  onPickImage,
}: Readonly<{
  imagen: PickedImage | null;
  isUploading: boolean;
  comprobanteUrl: string | null;
  onPickImage: (origen: 'camera' | 'library') => void;
}>) {
  const dash = useDashTheme();
  return (
    <ThemedView style={styles.foto}>
      {imagen ? (
        <Image source={{ uri: imagen.uri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <ThemedView style={[styles.preview, { backgroundColor: dash.cardHover, justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText type="small" style={{ color: dash.textMuted }}>
            Sin foto de comprobante
          </ThemedText>
        </ThemedView>
      )}
      {isUploading && (
        <ThemedView style={styles.uploadingRow}>
          <ActivityIndicator size="small" color={dash.accent} />
          <ThemedText type="small" style={{ color: dash.textSecondary }}>
            Subiendo comprobante (POST /pedidos/:id/comprobante)...
          </ThemedText>
        </ThemedView>
      )}
      {comprobanteUrl && (
        <ThemedText type="small" style={{ color: '#22c55e' }}>
          ✓ Comprobante subido con éxito
        </ThemedText>
      )}
      <ThemedView style={styles.fotoAcciones}>
        <Button label="Tomar foto" pill onPress={() => onPickImage('camera')} disabled={isUploading} />
        <Button label="Galería" variant="secondary" pill onPress={() => onPickImage('library')} disabled={isUploading} />
      </ThemedView>
    </ThemedView>
  );
}

export function ConfirmDeliveryModal({ visible, order, onClose, onDone }: ConfirmDeliveryModalProps) {
  const dash = useDashTheme();
  const [modo, setModo] = useState<Modo>('entregado');
  const [imagen, setImagen] = useState<PickedImage | null>(null);
  const [comprobanteUrl, setComprobanteUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setModo('entregado');
    setImagen(null);
    setComprobanteUrl(null);
    setIsUploading(false);
    setObservacion('');
    setError(null);
  }

  async function elegirImagen(origen: 'camera' | 'library') {
    if (!order) return;
    setError(null);
    try {
      const seleccionada = await pickImage(origen);
      if (!seleccionada) return;
      if (seleccionada.fileSize > MAX_TAMANO_FOTO) {
        setError('La foto supera el tamaño máximo permitido (3 MB). Intenta con otra.');
        return;
      }
      setImagen(seleccionada);
      setIsUploading(true);
      const url = await subirComprobante(order.id, seleccionada);
      setComprobanteUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el comprobante de entrega.');
      setComprobanteUrl(null);
      setImagen(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleConfirm() {
    if (isSubmitting || isUploading || !order) return;
    setError(null);

    if (modo === 'entregado' && !comprobanteUrl) {
      setError('Debes adjuntar y subir la foto del comprobante de entrega con éxito.');
      return;
    }
    if (modo === 'no_entregado' && observacion.trim().length === 0) {
      setError('Debes ingresar el motivo (observaciones) de la entrega no realizada.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (modo === 'entregado' && comprobanteUrl) {
        await entregarPedido(order.id, comprobanteUrl);
      } else {
        await marcarNoEntregado(order.id, observacion.trim());
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado del pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEntregadoValid = modo === 'entregado' && Boolean(comprobanteUrl) && !isUploading;
  const isNoEntregadoValid = modo === 'no_entregado' && observacion.trim().length > 0;
  const isFormValid = isEntregadoValid || isNoEntregadoValid;

  const inputStyle = [
    styles.input,
    { color: dash.text, backgroundColor: dash.cardHover, borderColor: dash.border },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onShow={reset} onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <ThemedView style={[styles.contenedor, { backgroundColor: dash.card, borderColor: dash.border }]}>
          <ThemedText type="smallBold" style={{ color: dash.text, fontSize: 16 }}>
            {modo === 'entregado' ? 'Confirmar entrega' : 'Entrega no realizada'}
          </ThemedText>

          {order && <OrderInfo order={order} />}

          <ModoSelector modo={modo} onSelect={setModo} />

          {modo === 'entregado' ? (
            <ComprobanteSection
              imagen={imagen}
              isUploading={isUploading}
              comprobanteUrl={comprobanteUrl}
              onPickImage={elegirImagen}
            />
          ) : (
            <TextInput
              value={observacion}
              onChangeText={setObservacion}
              placeholder="Ingresa el motivo (observaciones) obligatorias..."
              placeholderTextColor={dash.textMuted}
              style={[inputStyle, styles.textarea]}
              multiline
            />
          )}

          {error && (
            <ThemedText type="small" style={{ color: '#f87171' }}>
              {error}
            </ThemedText>
          )}

          <ThemedView style={styles.acciones}>
            <Pressable onPress={onClose} disabled={isSubmitting || isUploading}>
              <ThemedText type="small" style={{ color: dash.textMuted }}>
                Cancelar
              </ThemedText>
            </Pressable>
            <Button
              label={isSubmitting ? 'Enviando…' : 'Confirmar entrega'}
              pill
              loading={isSubmitting}
              onPress={handleConfirm}
              disabled={!isFormValid || isSubmitting || isUploading}
              style={{
                backgroundColor: modo === 'no_entregado' ? '#7f1d1d' : dash.accent,
                opacity: !isFormValid ? 0.5 : 1,
              }}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  contenedor: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
    borderWidth: 1,
  },
  datos: {
    gap: Spacing.half,
  },
  modoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modoChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
  },
  foto: {
    gap: Spacing.two,
  },
  preview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fotoAcciones: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  acciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
