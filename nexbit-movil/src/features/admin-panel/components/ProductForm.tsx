import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput } from 'react-native';

import {
  listProveedores,
  uploadProductImage,
  listAllCategories,
} from '@/features/admin-panel/services/admin.service';
import type { CreateProductPayload, Product } from '@/features/catalog/types/catalog.types';
import { Button } from '@/shared/components/button';
import { SelectField, type SelectOption } from '@/shared/components/select-field';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { pickImage } from '@/shared/utils/imagePicker';
import { resolveImageUrl } from '@/shared/utils/imageUrl';
import { validarPrecio, validarStock } from '@/shared/utils/validacion';

type ProductFormProps = Readonly<{
  onSubmit: (payload: CreateProductPayload) => Promise<unknown>;
  onCancel: () => void;
  initialData?: CreateProductPayload;
  products?: Product[];
}>;

const MAX_TAMANO_IMAGEN_PRODUCTO = 5 * 1024 * 1024;

function normalizarTexto(texto = ''): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function generarSku(nombreCategoria: string, nombreProducto: string, productos: Product[] = []): string {
  const prefijoCategoria = normalizarTexto(nombreCategoria).slice(0, 3);
  const prefijoNombre = normalizarTexto(nombreProducto).slice(0, 4);
  if (!prefijoCategoria || !prefijoNombre) {
    return '';
  }
  const lista = productos;
  let numero = lista.length + 1;
  let sku = `${prefijoCategoria}-${prefijoNombre}-${numero}`;
  while (lista.some((producto) => producto.sku === sku)) {
    numero += 1;
    sku = `${prefijoCategoria}-${prefijoNombre}-${numero}`;
  }
  return sku;
}

export function ProductForm({ onSubmit, onCancel, initialData, products = [] }: ProductFormProps) {
  const dash = useDashTheme();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [sku, setSku] = useState(initialData?.sku ?? '');
  const [skuTouched, setSkuTouched] = useState(Boolean(initialData));
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [stock, setStock] = useState(initialData?.stock !== undefined ? String(initialData.stock) : '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [supplierId, setSupplierId] = useState(initialData?.supplierId ?? '');
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ? (resolveImageUrl(initialData.imageUrl) ?? null) : null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoadingOpciones, setIsLoadingOpciones] = useState(true);
  const [opcionesError, setOpcionesError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [opcionesReloadKey, setOpcionesReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [categorias, proveedores] = await Promise.all([listAllCategories(), listProveedores()]);
        if (!active) {
          return;
        }
        setCategories(categorias.map((categoria) => ({ id: categoria.id, name: categoria.name })));
        setSuppliers(
          proveedores.map((proveedor) => ({
            id: String(proveedor.id_proveedor),
            name: proveedor.razon_social,
          })),
        );
        setOpcionesError(null);
      } catch {
        if (!active) {
          return;
        }
        setCategories([]);
        setSuppliers([]);
        setOpcionesError('No se pudieron cargar las categorías/proveedores. Revisa tu conexión.');
      } finally {
        if (active) {
          setIsLoadingOpciones(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [opcionesReloadKey]);

  const reintentarOpciones = useCallback(() => {
    setIsLoadingOpciones(true);
    setOpcionesError(null);
    setOpcionesReloadKey((key) => key + 1);
  }, []);

  const autoSku = useMemo(() => {
    if (initialData || skuTouched) {
      return '';
    }
    const categoria = categories.find((item) => item.id === categoryId);
    return generarSku(categoria ? categoria.name : '', name, products);
  }, [initialData, skuTouched, name, categoryId, categories, products]);

  const skuActual = skuTouched ? sku : autoSku || sku;

  const categoriaOpciones: SelectOption[] = categories.map((categoria) => ({
    label: categoria.name,
    value: categoria.id,
  }));

  const proveedorOpciones: SelectOption[] = suppliers.map((proveedor) => ({
    label: proveedor.name,
    value: proveedor.id,
  }));

  function validarCampos(): boolean {
    const nuevos: Record<string, string> = {};
    if (!name.trim()) nuevos.name = 'El nombre es obligatorio';
    if (!skuActual.trim()) nuevos.sku = 'El SKU es obligatorio';
    if (!validarPrecio(Number(price))) nuevos.price = 'El precio debe ser un número mayor a 0';
    if (!validarStock(Number(stock))) nuevos.stock = 'El stock debe ser un número mayor o igual a 0';
    if (!categoryId) nuevos.categoryId = 'Selecciona una categoría';
    if (!supplierId) nuevos.supplierId = 'Selecciona un proveedor';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }
    setSubmitError(null);
    if (!validarCampos()) {
      setSubmitError('Revisa los campos marcados en rojo.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description,
        sku: skuActual.trim(),
        price: Number(price),
        stock: Number(stock),
        categoryId,
        supplierId,
        available,
        imageUrl: imageUrl ?? undefined,
      });
      onCancel();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'No se pudo guardar el producto. Intenta de nuevo.');
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
      if (seleccionada.fileSize > MAX_TAMANO_IMAGEN_PRODUCTO) {
        setImageError('La imagen supera el tamaño máximo permitido (5 MB). Intenta con una más liviana.');
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
        style={[inputStyle, errores.name ? styles.inputError : null]}
      />
      {errores.name ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.name}</ThemedText>
      ) : null}
      <TextInput
        value={skuActual}
        onChangeText={(texto) => {
          setSkuTouched(true);
          setSku(texto);
        }}
        editable={isEditing}
        placeholder="SKU (ej: NEX-001)"
        placeholderTextColor={dash.textMuted}
        autoCapitalize="characters"
        style={[inputStyle, errores.sku ? styles.inputError : null]}
      />
      {errores.sku ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.sku}</ThemedText>
      ) : null}
      {!skuTouched && !initialData ? (
        <ThemedText type="small" style={{ color: dash.textMuted, fontSize: 11 }}>
          SKU generado automáticamente.
        </ThemedText>
      ) : null}
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
        style={[inputStyle, errores.price ? styles.inputError : null]}
      />
      {errores.price ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.price}</ThemedText>
      ) : null}
      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="Stock (cantidad disponible)"
        placeholderTextColor={dash.textMuted}
        keyboardType="numeric"
        style={[inputStyle, errores.stock ? styles.inputError : null]}
      />
      {errores.stock ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.stock}</ThemedText>
      ) : null}

      {opcionesError ? (
        <ThemedView style={styles.opcionesError}>
          <ThemedText type="small" style={{ color: '#f87171' }}>
            {opcionesError}
          </ThemedText>
          <Pressable onPress={reintentarOpciones} disabled={isLoadingOpciones}>
            <ThemedText type="small" style={{ color: dash.accent }}>
              Reintentar
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}

      <SelectField
        label="Categoría"
        options={categoriaOpciones}
        value={categoryId}
        onChange={setCategoryId}
        placeholder="Selecciona una categoría"
        loading={isLoadingOpciones}
        error={errores.categoryId}
      />
      {errores.categoryId ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.categoryId}</ThemedText>
      ) : null}

      <SelectField
        label="Proveedor"
        options={proveedorOpciones}
        value={supplierId}
        onChange={setSupplierId}
        placeholder="Selecciona un proveedor"
        loading={isLoadingOpciones}
        error={errores.supplierId}
      />
      {errores.supplierId ? (
        <ThemedText type="small" style={styles.errorTexto}>{errores.supplierId}</ThemedText>
      ) : null}

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

      {submitError ? (
        <ThemedText type="small" style={{ color: '#f87171' }}>
          {submitError}
        </ThemedText>
      ) : null}

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
          disabled={isSubmitting}
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
  inputError: {
    borderColor: '#f87171',
  },
  errorTexto: {
    color: '#f87171',
    marginTop: -Spacing.one,
  },
  opcionesError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
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