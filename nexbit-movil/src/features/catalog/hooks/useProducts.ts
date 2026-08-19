import { useCallback, useEffect, useState } from 'react';

import * as catalogService from '@/features/catalog/services/catalog.service';
import type { Category, Product } from '@/features/catalog/types/catalog.types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          catalogService.listProducts(selectedCategory),
          catalogService.listCategories(),
        ]);
        if (!cancelled) {
          setProducts(productsData);
          setCategories(categoriesData);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
    reload,
  };
}