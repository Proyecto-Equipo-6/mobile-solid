import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput } from 'react-native';

import {
  listProveedores,
  uploadProductImage,
} from '@/features/admin-panel/services/admin.service';
import { listCategories } from '@/features/catalog/services/catalog.service';
import type { CreateProductPayload } from '@/features/catalog/types/catalog.types';
import { Button } from '@/shared/components/button';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { pickImage } from '@/shared/utils/imagePicker';
import { resolveImageUrl } from '@/shared/utils/imageUrl';

type ProductFormProps = {
  onSubmit: (payload: CreateProductPayload) => Promise<unknown>;
  onCancel: () => void;
  initialData?: CreateProductPayload;
};

export function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const dash = useDashTheme();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [sku, setSku] = useState(initialData?.sku ?? '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [supplierId, setSupplierId] = useState(initialData?.supplierId ?? '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ? (resolveImageUrl(initialData.imageUrl) ?? null) : null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listCategories(), listProveedores()])
      .then(([categorias, proveedores]) => {
        setCategories(categorias.map((categoria) => ({ id: categoria.id, name: categoria.name })));
        setSuppliers(
          proveedores.map((proveedor) => ({
            id: String(proveedor.id_proveedor),
            name: proveedor.razon_social,
          })),
        );
      })
      .catch(() => {
        setCategories([]);
        setSuppliers([]);
      });
  }, []);

  async function handleSubmit() {
    if (isSubmitting || !name || !sku || !price || !categoryId || !supplierId) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        description,
        sku,
        price: Number(price),
        categoryId,
        supplierId,
        available,
        imageUrl: imageUrl ?? undefined,
      });
      onCancel();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePickImage() {
    if (isUploading) {
      return;
    }
    setImageError(null);
    try {
      const seleccionada = await pickImage('library');
      if (!seleccionada) {
        return;
      }
      setPreviewUri(seleccionada.uri);
      setIsUploading(true);
      try {
        const url = await uploadProductImage(seleccionada);
        setImageUrl(url);
      } catch {
        setPreviewUri(null);
        setImageError('No se pudo subir la imagen. Intenta de nuevo.');
      } finally {
        setIsUploading(false);
      }
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'No se pudo cargar la imagen.');
    }
  }

  function handleRemoveImage() {
    setImageUrl(null);
    setPreviewUri(null);
    setImageError(null);
  }

  const inputStyle = [
    styles.input,
    {
      color: dash.text,
      backgroundColor: dash.cardHover,
      borderColor: dash.border,
    },
  ];

  const isEditing = Boolean(initialData);
  const activeImageUri = previewUri ?? imageUrl;

  return (
    <ThemedView style={[styles.form, { backgroundColor: dash.card, borderColor: dash.border }]}>
      <ThemedText type="smallBold" style={{ color: dash.text }}>
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </ThemedText>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
        placeholderTextColor={dash.textMuted}
        style={inputStyle}
      />
      <TextInput
        value={sku}
        onChangeText={setSku}
        placeholder="SKU (ej: NEX-001)"
        placeholderTextColor={dash.textMuted}
        autoCapitalize="characters"
        style={inputStyle}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        placeholderTextColor={dash.textMuted}
        style={[inputStyle, styles.textarea]}
        multiline
      />
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Precio (COP)"
        placeholderTextColor={dash.textMuted}
        keyboardType="numeric"
        style={inputStyle}
      />

      <ThemedText type="smallBold" style={{ color: dash.textSecondary, fontSize: 12 }}>
        Categoría
      </ThemedText>
      <ThemedView style={styles.chips}>
        {categories.map((category) => {
          const selected = categoryId === category.id;
          return (
            <Pressable key={category.id} onPress={() => setCategoryId(category.id)}>
              <ThemedView
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? dash.accent : dash.cardHover,
                    borderColor: selected ? dash.accent : dash.border,
                    borderWidth: 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selected ? dash.sobreAccent : dash.textSecondary, fontSize: 12 }}>
                  {category.name}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <ThemedText type="smallBold" style={{ color: dash.textSecondary, fontSize: 12 }}>
        Proveedor
      </ThemedText>
      <ThemedView style={styles.chips}>
        {suppliers.map((supplier) => {
          const selected = supplierId === supplier.id;
          return (
            <Pressable key={supplier.id} onPress={() => setSupplierId(supplier.id)}>
              <ThemedView
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? dash.accent : dash.cardHover,
                    borderColor: selected ? dash.accent : dash.border,
                    borderWidth: 1,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: selected ? dash.sobreAccent : dash.textSecondary, fontSize: 12 }}>
                  {supplier.name}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>

      <ThemedText type="smallBold" style={{ color: dash.textSecondary, fontSize: 12 }}>
        Imagen del producto
      </ThemedText>
      <ThemedView style={styles.imagenRow}>
        {activeImageUri ? (
          <Image source={{ uri: activeImageUri }} style={styles.preview} resizeMode="cover" />
        ) : null}
        <ThemedView style={styles.imagenAcciones}>
          <Button
            label={isUploading ? 'Subiendo…' : 'Agregar foto'}
            variant="secondary"
            pill
            loading={isUploading}
            onPress={handlePickImage}
          />
          {(imageUrl || previewUri) ? (
            <Pressable onPress={handleRemoveImage} disabled={isUploading}>
              <ThemedText type="small" style={{ color: dash.textMuted }}>
                Quitar imagen
              </ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>
      </ThemedView>
      {imageError ? (
        <ThemedText type="small" style={{ color: '#f87171' }}>
          {imageError}
        </ThemedText>
      ) : null}

      <Pressable onPress={() => setAvailable((value) => !value)} style={styles.toggle}>
        <ThemedView
          style={[styles.toggleDot, { backgroundColor: available ? '#4ade80' : dash.textMuted }]}
        />
        <ThemedText type="small" style={{ color: dash.textSecondary }}>
          {available ? 'Disponible para la venta' : 'Oculto (no disponible)'}
        </ThemedText>
      </Pressable>

      <ThemedView style={styles.actions}>
        <Pressable onPress={onCancel} disabled={isSubmitting}>
          <ThemedText type="small" style={{ color: dash.textMuted }}>
            Cancelar
          </ThemedText>
        </Pressable>
        <Button
          label={isEditing ? 'Actualizar' : 'Guardar'}
          pill
          loading={isSubmitting}
          disabled={!name || !sku || !price || !categoryId || !supplierId}
          onPress={handleSubmit}
          style={{ backgroundColor: dash.accent }}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  imagenRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  preview: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  imagenAcciones: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.two,
  },
  toggleDot: {
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
});