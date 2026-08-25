import { useCallback, useEffect, useState } from 'react';

import * as adminService from '@/features/admin-panel/services/admin.service';
import type {
  AdminOrder,
  CategoriaAdmin,
  DriverOption,
  InventorySummary,
  ProveedorAdmin,
  RepartidorAdmin,
  RolAdmin,
  UsuarioAdmin,
} from '@/features/admin-panel/types/admin.types';
import type { CreateProductPayload, Product, UpdateProductPayload } from '@/features/catalog/types/catalog.types';
import type { PickedImage } from '@/shared/utils/imagePicker';

function kpiValue(kpis: { id: string; valor: number }[], id: string): number {
  return kpis.find((kpi) => kpi.id === id)?.valor ?? 0;
}

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
        const [productsData, analytics] = await Promise.all([
          adminService.listProducts(),
          adminService.getAnalyticsSummary(),
        ]);
        if (!cancelled) {
          setProducts(productsData);
          setSummary({
            totalProducts: kpiValue(analytics.kpis, 'productos'),
            unavailableProducts: productsData.filter((product) => !product.available).length,
            totalOrders: kpiValue(analytics.kpis, 'pedidos'),
            totalSales: kpiValue(analytics.kpis, 'ventas'),
          });
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
    setSummary((current) =>
      current
        ? {
            ...current,
            totalProducts: current.totalProducts + 1,
            unavailableProducts: product.available
              ? current.unavailableProducts
              : current.unavailableProducts + 1,
          }
        : current,
    );
    return product;
  }, []);

  const editProduct = useCallback(async (id: string, payload: UpdateProductPayload) => {
    const product = await adminService.updateProduct(id, payload);
    setProducts((current) => current.map((item) => (item.id === id ? product : item)));
    return product;
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    const removed = products.find((product) => product.id === id);
    await adminService.deleteProduct(id);
    setProducts((current) => current.filter((item) => item.id !== id));
    if (removed) {
      setSummary((current) =>
        current
          ? {
              ...current,
              totalProducts: Math.max(0, current.totalProducts - 1),
              unavailableProducts: removed.available
                ? current.unavailableProducts
                : Math.max(0, current.unavailableProducts - 1),
            }
          : current,
      );
    }
  }, [products]);

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
    const order = await adminService.assignOrder(orderId, driverId);
    setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, ...order } : item)));
  }, []);

  const confirmOrder = useCallback(async (orderId: string) => {
    const order = await adminService.updateOrderStatus(orderId, 'CONFIRMADO');
    setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, ...order } : item)));
  }, []);

  const deliverOrder = useCallback(async (orderId: string, imagen: PickedImage, observacion?: string) => {
    const order = await adminService.deliverOrderWithEvidence(orderId, imagen, observacion);
    setOrders((current) => current.map((item) => (item.id === orderId ? { ...item, ...order } : item)));
  }, []);

  return { orders, drivers, isLoading, error, assignOrder, confirmOrder, deliverOrder, reload };
}

// === HOOK: USUARIOS ===
export function useAdminUsers() {
  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          adminService.listUsers(),
          adminService.listRolesForDropdown(),
        ]);
        if (!cancelled) {
          setUsers(usersData);
          setRoles(rolesData);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los usuarios');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = useCallback(() => { setIsLoading(true); setReloadKey((k) => k + 1); }, []);

  const create = useCallback(async (payload: import('@/features/admin-panel/types/admin.types').CreateUserPayload) => {
    const user = await adminService.createUser(payload);
    setUsers((c) => [user, ...c]);
    return user;
  }, []);

  const update = useCallback(async (id: string, payload: import('@/features/admin-panel/types/admin.types').UpdateUserPayload) => {
    const user = await adminService.updateUser(id, payload);
    setUsers((c) => c.map((u) => (u.id === id ? user : u)));
    return user;
  }, []);

  const remove = useCallback(async (id: string) => {
    await adminService.deleteUser(id);
    setUsers((c) => c.filter((u) => u.id !== id));
  }, []);

  return { users, roles, isLoading, error, create, update, remove, reload };
}

// === HOOK: CATEGORÍAS ===
export function useAdminCategories() {
  const [categories, setCategories] = useState<CategoriaAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.listAllCategories();
        if (!cancelled) { setCategories(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar las categorías');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = useCallback(() => { setIsLoading(true); setReloadKey((k) => k + 1); }, []);

  const create = useCallback(async (payload: { nombre: string; descripcion: string; estado: string }) => {
    const cat = await adminService.createCategory(payload);
    setCategories((c) => [cat, ...c]);
    return cat;
  }, []);

  const update = useCallback(async (id: string, payload: { nombre: string; descripcion: string; estado: string }) => {
    const cat = await adminService.updateCategory(id, payload);
    setCategories((c) => c.map((x) => (x.id === id ? cat : x)));
    return cat;
  }, []);

  const remove = useCallback(async (id: string) => {
    await adminService.deleteCategory(id);
    setCategories((c) => c.filter((x) => x.id !== id));
  }, []);

  return { categories, isLoading, error, create, update, remove, reload };
}

// === HOOK: PROVEEDORES ===
export function useAdminSuppliers() {
  const [suppliers, setSuppliers] = useState<ProveedorAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.listAllSuppliers();
        if (!cancelled) { setSuppliers(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los proveedores');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = useCallback(() => { setIsLoading(true); setReloadKey((k) => k + 1); }, []);

  const create = useCallback(async (payload: { nit_proveedor: string; razon_social: string; telefono: string; email: string }) => {
    const sup = await adminService.createSupplier(payload);
    setSuppliers((c) => [sup, ...c]);
    return sup;
  }, []);

  const update = useCallback(async (id: string, payload: { nit_proveedor: string; razon_social: string; telefono: string; email: string; estado?: number }) => {
    const sup = await adminService.updateSupplier(id, payload);
    setSuppliers((c) => c.map((x) => (x.id === id ? sup : x)));
    return sup;
  }, []);

  const remove = useCallback(async (id: string) => {
    await adminService.deleteSupplier(id);
    setSuppliers((c) => c.filter((x) => x.id !== id));
  }, []);

  return { suppliers, isLoading, error, create, update, remove, reload };
}

// === HOOK: REPARTIDORES ===
export function useAdminDrivers() {
  const [drivers, setDrivers] = useState<RepartidorAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.listDriversAdmin();
        if (!cancelled) { setDrivers(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los repartidores');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = useCallback(() => { setIsLoading(true); setReloadKey((k) => k + 1); }, []);

  const create = useCallback(async (payload: { nombre_apellido: string; email: string; password: string; telefono: string; vehiculo?: string; placa?: string }) => {
    await adminService.createDriver(payload);
    setReloadKey((k) => k + 1);
  }, []);

  const update = useCallback(async (id: string, payload: { nombre_apellido?: string; email?: string; telefono?: string; vehiculo?: string; placa?: string }) => {
    await adminService.updateDriver(id, payload);
    setReloadKey((k) => k + 1);
  }, []);

  const remove = useCallback(async (id: string) => {
    await adminService.deleteDriver(id);
    setDrivers((c) => c.filter((x) => x.id !== id));
  }, []);

  return { drivers, isLoading, error, create, update, remove, reload };
}

// === HOOK: ROLES ===
export function useAdminRoles() {
  const [roles, setRoles] = useState<RolAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminService.listRoles();
        if (!cancelled) { setRoles(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudieron cargar los roles');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const reload = useCallback(() => { setIsLoading(true); setReloadKey((k) => k + 1); }, []);

  const create = useCallback(async (payload: { name: string; description: string }) => {
    const role = await adminService.createRole(payload);
    setRoles((c) => [role, ...c]);
    return role;
  }, []);

  const update = useCallback(async (id: string, payload: { name: string; description: string }) => {
    const role = await adminService.updateRole(id, payload);
    setRoles((c) => c.map((r) => (r.id === id ? role : r)));
    return role;
  }, []);

  return { roles, isLoading, error, create, update, reload };
}