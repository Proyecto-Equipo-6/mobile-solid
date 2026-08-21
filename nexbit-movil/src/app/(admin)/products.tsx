import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ProductForm } from '@/features/admin-panel/components/ProductForm';
import { useAdminInventory } from '@/features/admin-panel/hooks/useAdminInventory';
import { ThemedText } from '@/shared/components/themed-text';
import { ThemedView } from '@/shared/components/themed-view';
import { DashColors, Spacing } from '@/shared/constants/theme';
import { useDashTheme } from '@/shared/hooks/use-dash-theme';
import { formatCurrency } from '@/shared/utils/format';
import type { CreateProductPayload, Product } from '@/features/catalog/types/catalog.types';

export default function ProductsScreen() {
  const dash = useDashTheme();
  const { products, summary, isLoading, error, addProduct, editProduct, removeProduct, reload } =
    useAdminInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}>
        <ActivityIndicator color={dash.accent} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: dash.bg }]}>
        <ThemedText style={styles.errorTexto}>{error}</ThemedText>
        <Pressable onPress={reload}>
          <ThemedText style={styles.enlace}>Reintentar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleSubmit(payload: CreateProductPayload) {
    if (editingProduct) {
      await editProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }
    handleCancel();
  }

  function buildInitialData(product: Product): CreateProductPayload {
    return {
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      sku: product.sku,
      categoryId: product.categoryId ?? '',
      supplierId: '',
      available: product.available,
      imageUrl: product.imageUrl,
    };
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: dash.bg }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.titulo}>Inventario</ThemedText>
        <ThemedText style={styles.subtitulo}>
          {summary?.totalProducts ?? 0} productos · {summary?.unavailableProducts ?? 0} no disponibles
        </ThemedText>
      </ThemedView>

      {(showForm || editingProduct) && (
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingProduct ? buildInitialData(editingProduct) : undefined}
        />
      )}

      <Pressable
        onPress={() => {
          setEditingProduct(null);
          setShowForm((value) => !value);
        }}
        style={[styles.addButton, { backgroundColor: dash.accent }]}>
        <ThemedText type="smallBold" style={{ color: dash.sobreAccent }}>
          {showForm || editingProduct ? 'Ocultar formulario' : 'Nuevo producto'}
        </ThemedText>
      </Pressable>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ThemedView style={[styles.productRow, { backgroundColor: dash.card, borderColor: dash.border }]}>
            <ThemedView style={styles.productInfo}>
              <ThemedText type="smallBold" style={{ color: dash.text }}>
                {item.name}
              </ThemedText>
              <ThemedText type="small" style={{ color: dash.textSecondary }}>
                {formatCurrency(item.price)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.estadoWrap}>
              {item.available ? (
                <ThemedView style={[styles.badge, { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
                  <ThemedText type="smallBold" style={{ color: '#4ade80', fontSize: 11 }}>
                    Disponible
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedView style={[styles.badge, { backgroundColor: 'rgba(220, 38, 38, 0.15)' }]}>
                  <ThemedText type="smallBold" style={{ color: '#f87171', fontSize: 11 }}>
                    No disponible
                  </ThemedText>
                </ThemedView>
              )}
              <Pressable onPress={() => handleEdit(item)} style={styles.actionButton}>
                <ThemedText type="small" style={{ color: dash.accent }}>
                  Editar
                </ThemedText>
              </Pressable>
              <Pressable onPress={() => removeProduct(item.id)} style={styles.actionButton}>
                <ThemedText type="small" style={{ color: '#f87171' }}>
                  Eliminar
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  errorTexto: {
    color: DashColors.textSecondary,
  },
  enlace: {
    color: DashColors.accent,
    fontWeight: '600',
  },
  header: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  titulo: {
    color: DashColors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitulo: {
    color: DashColors.textSecondary,
    fontSize: 14,
  },
  addButton: {
    marginHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  listContent: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  estadoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});