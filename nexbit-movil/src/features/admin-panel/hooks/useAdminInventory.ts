import { useCallback, useEffect, useState } from 'react';

import * as adminService from '@/features/admin-panel/services/admin.service';
import type { AdminOrder, DriverOption, InventorySummary } from '@/features/admin-panel/types/admin.types';
import type { CreateProductPayload, Product, UpdateProductPayload } from '@/features/catalog/types/catalog.types';

export function useAdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [productsData, summaryData] = await Promise.all([
          adminService.listProducts(),
          adminService.getInventorySummary(),
        ]);
        if (!cancelled) {
          setProducts(productsData);
          setSummary(summaryData);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar el inventario');
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
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const addProduct = useCallback(async (payload: CreateProductPayload) => {
    const product = await adminService.createProduct(payload);
    setProducts((current) => [product, ...current]);
    return product;
  }, []);

  const editProduct = useCallback(async (id: string, payload: UpdateProductPayload) => {
    const product = await adminService.updateProduct(id, payload);
    setProducts((current) => current.map((item) => (item.id === id ? product : item)));
    return product;
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await adminService.deleteProduct(id);
    setProducts((current) => current.filter((item) => item.id !== id));
  }, []);

  return {
    products,
    summary,
    isLoading,
    error,
    addProduct,
    editProduct,
    removeProduct,
    reload,
  };
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ordersData, driversData] = await Promise.all([
          adminService.listAdminOrders(),
          adminService.listDrivers(),
        ]);
        if (!cancelled) {
          setOrders(ordersData);
          setDrivers(driversData);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudieron cargar los pedidos');
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
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const assignOrder = useCallback(async (orderId: string, driverId: string) => {
    const order = await adminService.assignOrder({ orderId, driverId });
    setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, ...order } : item)));
  }, []);

  return { orders, drivers, isLoading, error, assignOrder, reload };
}