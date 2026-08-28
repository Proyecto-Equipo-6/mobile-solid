import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAnalyticsSummary,
  listAdminOrders,
  listDrivers,
  assignOrder,
  updateOrderStatus,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  listDriversAdmin,
  createDriver,
  updateDriver,
  deleteDriver,
  listRoles,
  createRole,
  updateRole,
} from '@/features/admin-panel/services/admin.service';

global.fetch = jest.fn();

function mockFetch(body: unknown, options: { ok?: boolean; status?: number } = {}) {
  const bodyString = JSON.stringify(body);
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: options.ok ?? true,
    status: options.status ?? 200,
    json: async () => body,
    text: async () => bodyString,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('admin.service - integración', () => {
  describe('listProducts', () => {
    it('retorna array de Product mapeados', async () => {
      mockFetch([
        { id_producto: 1, sku: 'SKU-001', nombre: 'Laptop', precio: 2500000, stock: 10, estado: 1 },
        { id_producto: 2, sku: 'SKU-002', nombre: 'Mouse', precio: 80000, stock: 50, estado: 0 },
      ]);

      const products = await listProducts();

      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Laptop');
      expect(products[0].available).toBe(true);
      expect(products[1].available).toBe(false);
    });
  });

  describe('createProduct', () => {
    it('llama POST /productos y retorna Product mapeado', async () => {
      mockFetch({
        id_producto: 3,
        sku: 'SKU-003',
        nombre: 'Teclado',
        precio: 50000,
        stock: 20,
        estado: 1,
      });

      const product = await createProduct({
        sku: 'SKU-003',
        categoryId: '1',
        supplierId: '1',
        name: 'Teclado',
        price: 50000,
        stock: 20,
        available: true,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(product.name).toBe('Teclado');
    });
  });

  describe('updateProduct', () => {
    it('llama PUT /productos/:id y retorna Product actualizado', async () => {
      mockFetch({
        id_producto: 1,
        sku: 'SKU-001',
        nombre: 'Laptop HP',
        precio: 2600000,
        stock: 8,
        estado: 1,
      });

      const product = await updateProduct('1', { price: 2600000, stock: 8 });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/1'),
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(product.price).toBe(2600000);
    });
  });

  describe('deleteProduct', () => {
    it('llama DELETE /productos/:id', async () => {
      mockFetch(undefined);

      await deleteProduct('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/productos/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('getAnalyticsSummary', () => {
    it('retorna AnalyticsResumen', async () => {
      mockFetch({
        kpis: [
          { id: 'productos', valor: 25 },
          { id: 'pedidos', valor: 100 },
          { id: 'ventas', valor: 5000000 },
        ],
      });

      const summary = await getAnalyticsSummary();

      expect(summary.kpis).toHaveLength(3);
      expect(summary.kpis[0].id).toBe('productos');
    });
  });

  describe('listAdminOrders', () => {
    it('retorna array de AdminOrder mapeados', async () => {
      mockFetch([
        { id_pedido: 1, clienteNombre: 'Juan', estado: 'PENDIENTE', total: 35000, fecha_pedido: '2026-08-27T10:00:00Z' },
      ]);

      const orders = await listAdminOrders();

      expect(orders).toHaveLength(1);
      expect(orders[0].customerName).toBe('Juan');
    });

    it('maneja respuesta con wrapper { data: [...] }', async () => {
      mockFetch({
        data: [
          { id_pedido: 1, clienteNombre: 'Ana', estado: 'CONFIRMADO', total: 20000, fecha_pedido: '2026-08-27T10:00:00Z' },
        ],
        total: 1,
        page: 1,
        limit: 10,
      });

      const orders = await listAdminOrders();

      expect(orders).toHaveLength(1);
    });
  });

  describe('listDrivers', () => {
    it('retorna array de DriverOption', async () => {
      mockFetch([
        { id_repartidor: 1, nombre_apellido: 'Carlos Conductor', telefono: '3001234567' },
      ]);

      const drivers = await listDrivers();

      expect(drivers).toHaveLength(1);
      expect(drivers[0].name).toBe('Carlos Conductor');
    });
  });

  describe('assignOrder', () => {
    it('llama PUT con id_repartidor', async () => {
      mockFetch({ id_pedido: 1, estado: 'ASIGNADO', cliente_nombre: 'Juan', total: 35000, fecha_pedido: '2026-08-27T10:00:00Z' });

      await assignOrder('1', '5');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/pedidos/1/asignar'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('llama PUT con el nuevo estado', async () => {
      mockFetch({ id_pedido: 1, estado: 'CONFIRMADO', cliente_nombre: 'Juan', total: 35000, fecha_pedido: '2026-08-27T10:00:00Z' });

      await updateOrderStatus('1', 'CONFIRMADO');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/pedidos/1/estado'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('listUsers', () => {
    it('retorna array de UsuarioAdmin mapeados', async () => {
      mockFetch([
        { id_usuario: 1, nombre_apellido: 'Admin', email: 'admin@test.com', id_rol: 1, rol_nombre: 'Admin' },
      ]);

      const users = await listUsers();

      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Admin');
    });
  });

  describe('createUser', () => {
    it('llama POST y retorna UsuarioAdmin mapeado', async () => {
      mockFetch({
        usuario: {
          id_usuario: 10,
          nombre_apellido: 'Nuevo',
          email: 'nuevo@test.com',
          id_rol: 2,
          rol_nombre: 'Cliente',
        },
      });

      const user = await createUser({
        nombre_apellido: 'Nuevo',
        email: 'nuevo@test.com',
        password: '1234',
        id_rol: 2,
      });

      expect(user.name).toBe('Nuevo');
    });
  });

  describe('updateUser', () => {
    it('llama PUT y retorna UsuarioAdmin actualizado', async () => {
      mockFetch({
        usuario: {
          id_usuario: 1,
          nombre_apellido: 'Actualizado',
          email: 'upd@test.com',
          id_rol: 2,
          rol_nombre: 'Cliente',
        },
      });

      const user = await updateUser('1', { nombre_apellido: 'Actualizado' });

      expect(user.name).toBe('Actualizado');
    });
  });

  describe('deleteUser', () => {
    it('llama DELETE /admin/usuarios/:id', async () => {
      mockFetch(undefined);

      await deleteUser('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/usuarios/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('listAllCategories', () => {
    it('retorna array de CategoriaAdmin mapeados', async () => {
      mockFetch([
        { id_categoria: 1, nombre: 'Tecnología', estado: 1, descripcion: 'aptops' },
      ]);

      const categories = await listAllCategories();

      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe('Tecnología');
    });
  });

  describe('createCategory', () => {
    it('llama POST y retorna CategoriaAdmin', async () => {
      mockFetch({ id_categoria: 5, nombre: 'Deportes', estado: 1, descripcion: ' deportivos' });

      const cat = await createCategory({ nombre: 'Deportes', descripcion: ' deportivos', estado: '1' });

      expect(cat.name).toBe('Deportes');
    });
  });

  describe('updateCategory', () => {
    it('llama PUT y retorna CategoriaAdmin actualizada', async () => {
      mockFetch({ id_categoria: 1, nombre: 'Tecnología Actualizada', estado: 1, descripcion: ' actualizado' });

      const cat = await updateCategory('1', { nombre: 'Tecnología Actualizada', descripcion: ' actualizado', estado: '1' });

      expect(cat.name).toBe('Tecnología Actualizada');
    });
  });

  describe('deleteCategory', () => {
    it('llama DELETE /categorias/:id', async () => {
      mockFetch(undefined);

      await deleteCategory('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/categorias/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('listAllSuppliers', () => {
    it('retorna array de ProveedorAdmin mapeados', async () => {
      mockFetch([
        { id_proveedor: 1, nit_proveedor: '900123', razon_social: 'Tech SA', estado: 1 },
      ]);

      const suppliers = await listAllSuppliers();

      expect(suppliers).toHaveLength(1);
      expect(suppliers[0].name).toBe('Tech SA');
    });
  });

  describe('createSupplier', () => {
    it('llama POST y retorna ProveedorAdmin', async () => {
      mockFetch({ id_proveedor: 3, nit_proveedor: '900456', razon_social: 'New SA', estado: 1 });

      const sup = await createSupplier({ nit_proveedor: '900456', razon_social: 'New SA', telefono: '300', email: 'n@test.com' });

      expect(sup.name).toBe('New SA');
    });
  });

  describe('updateSupplier', () => {
    it('llama PUT y retorna ProveedorAdmin actualizado', async () => {
      mockFetch({ id_proveedor: 1, nit_proveedor: '900123', razon_social: 'Updated SA', estado: 1 });

      const sup = await updateSupplier('1', { nit_proveedor: '900123', razon_social: 'Updated SA', telefono: '300', email: 'u@test.com' });

      expect(sup.name).toBe('Updated SA');
    });
  });

  describe('deleteSupplier', () => {
    it('llama DELETE /proveedores/:id', async () => {
      mockFetch(undefined);

      await deleteSupplier('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/proveedores/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('listDriversAdmin', () => {
    it('retorna array de RepartidorAdmin mapeados', async () => {
      mockFetch([
        { id_repartidor: 1, nombre: 'Carlos', email: 'c@test.com', telefono: '3001234567', estado: 'DISPONIBLE' },
      ]);

      const drivers = await listDriversAdmin();

      expect(drivers).toHaveLength(1);
      expect(drivers[0].name).toBe('Carlos');
    });
  });

  describe('createDriver', () => {
    it('llama POST /admin/repartidores', async () => {
      mockFetch(undefined);

      await createDriver({ nombre_apellido: 'Nuevo', email: 'n@test.com', password: '1234', telefono: '300' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/repartidores'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  describe('updateDriver', () => {
    it('llama PUT /admin/repartidores/:id', async () => {
      mockFetch(undefined);

      await updateDriver('1', { nombre_apellido: 'Actualizado' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/repartidores/1'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('deleteDriver', () => {
    it('llama DELETE /admin/repartidores/:id', async () => {
      mockFetch(undefined);

      await deleteDriver('1');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/repartidores/1'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('listRoles', () => {
    it('retorna array de RolAdmin mapeados', async () => {
      mockFetch([
        { id: 1, name: 'Admin', description: 'Administrador' },
      ]);

      const roles = await listRoles();

      expect(roles).toHaveLength(1);
      expect(roles[0].name).toBe('Admin');
    });
  });

  describe('createRole', () => {
    it('llama POST y retorna RolAdmin', async () => {
      mockFetch({ id: 5, name: 'Invitado', description: 'Guest role' });

      const role = await createRole({ name: 'Invitado', description: 'Guest role' });

      expect(role.name).toBe('Invitado');
    });
  });

  describe('updateRole', () => {
    it('llama PUT y retorna RolAdmin actualizado', async () => {
      mockFetch({ id: 1, name: 'Super Admin', description: 'Full access' });

      const role = await updateRole('1', { name: 'Super Admin', description: 'Full access' });

      expect(role.name).toBe('Super Admin');
    });
  });
});
