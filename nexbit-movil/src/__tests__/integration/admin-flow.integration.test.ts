/**
 * Prueba de Integración: Flujo del Admin Panel
 *
 * Verifica operaciones CRUD del admin: productos, usuarios, categorías,
 * proveedores, repartidores, roles y analítica.
 */

import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/shared/api/client');

const mockedClient = jest.mocked(require('@/shared/api/client'));

const MOCK_USUARIO_ADMIN = {
  id_usuario: 1,
  id_rol: 2,
  nombre_apellido: 'Juan Admin',
  email: 'juan@nexbit.com',
  telefono: '3001234567',
  tipo_documento: 'CC',
  numero_documento: '12345',
  direccion: 'Calle 10',
  activo: 1,
};

const MOCK_CATEGORIA = {
  id_categoria: 1,
  nombre: 'Tecnología',
  descripcion: 'Dispositivos electrónicos',
  estado: 1,
};

const MOCK_PROVEEDOR = {
  id_proveedor: 1,
  nit_proveedor: '900123456',
  razon_social: 'TechCorp S.A.S',
  telefono: '3001234567',
  email: 'contacto@techcorp.com',
  estado: 1,
};

const MOCK_REPARTIDOR_ADMIN = {
  id_repartidor: 1,
  nombre: 'Pedro Repartidor',
  email: 'pedro@nexbit.com',
  telefono: '3009876543',
  estado: 'DISPONIBLE',
  pedidos_hoy: 3,
  pedidos_semana: 15,
  pedidos_mes: 60,
};

const MOCK_ROL = {
  id: 1,
  name: 'Administrador',
  description: 'Acceso total al sistema',
};

const MOCK_ANALYTICS = {
  kpis: [
    { id: '1', titulo: 'Ventas Hoy', valor: 1500000, delta: 5, subtitulo: 'vs ayer', tipo: 'moneda', serie: [] },
  ],
  ventasPorMes: [],
  pedidosPorEstado: [],
  productosMasVendidos: [],
  topClientes: [],
};

let callCount = 0;

function mockGet(url: string) {
  if (url === '/admin/usuarios') return Promise.resolve([MOCK_USUARIO_ADMIN]);
  if (url === '/categorias/todas') return Promise.resolve([MOCK_CATEGORIA]);
  if (url === '/proveedores/todos') return Promise.resolve([MOCK_PROVEEDOR]);
  if (url === '/admin/repartidores') return Promise.resolve([MOCK_REPARTIDOR_ADMIN]);
  if (url === '/roles') return Promise.resolve([MOCK_ROL]);
  if (url === '/analitica/resumen') return Promise.resolve(MOCK_ANALYTICS);
  if (url === '/productos') return Promise.resolve([]);
  if (url === '/admin/pedidos') return Promise.resolve({ data: [], total: 0, page: 1, limit: 10 });
  return Promise.reject({ status: 404 });
}

function mockPost(url: string, body: unknown) {
  if (url === '/admin/usuarios') {
    callCount++;
    return Promise.resolve({ usuario: { ...MOCK_USUARIO_ADMIN, id_usuario: 100 + callCount, ...(body as Record<string, unknown>) } });
  }
  if (url === '/categorias') {
    callCount++;
    return Promise.resolve({ id_categoria: 100 + callCount, ...(body as Record<string, unknown>) });
  }
  if (url === '/proveedores') {
    callCount++;
    return Promise.resolve({ id_proveedor: 100 + callCount, ...(body as Record<string, unknown>) });
  }
  if (url === '/admin/repartidores') {
    return Promise.resolve({ mensaje: 'Repartidor creado' });
  }
  if (url === '/roles') {
    callCount++;
    return Promise.resolve({ id: 100 + callCount, ...(body as Record<string, unknown>) });
  }
  return Promise.reject({ status: 404 });
}

function mockPut(url: string, body: unknown) {
  if (url.startsWith('/admin/usuarios/')) {
    const id = url.split('/').pop();
    return Promise.resolve({ usuario: { ...MOCK_USUARIO_ADMIN, id_usuario: Number(id), ...(body as Record<string, unknown>) } });
  }
  if (url.startsWith('/categorias/')) {
    const id = url.split('/').pop();
    return Promise.resolve({ ...MOCK_CATEGORIA, id_categoria: Number(id), ...(body as Record<string, unknown>) });
  }
  if (url.startsWith('/proveedores/')) {
    const id = url.split('/').pop();
    return Promise.resolve({ ...MOCK_PROVEEDOR, id_proveedor: Number(id), ...(body as Record<string, unknown>) });
  }
  if (url.startsWith('/admin/repartidores/')) {
    return Promise.resolve({ mensaje: 'Repartidor actualizado' });
  }
  if (url === '/roles' || url.startsWith('/roles/')) {
    return Promise.resolve({ ...MOCK_ROL, ...(body as Record<string, unknown>) });
  }
  return Promise.reject({ status: 404 });
}

beforeEach(() => {
  jest.clearAllMocks();
  callCount = 0;
  mockedClient.api = {
    get: jest.fn(mockGet),
    post: jest.fn(mockPost),
    put: jest.fn(mockPut),
    patch: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(undefined),
    upload: jest.fn().mockResolvedValue({ imagen_url: 'https://cdn.example.com/img.jpg' }),
  };
});

describe('Integración — Flujo del Admin Panel', () => {
  it('listUsers retorna usuarios con campos mapeados', async () => {
    const users = await adminService.listUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Juan Admin');
    expect(users[0].email).toBe('juan@nexbit.com');
    expect(users[0].active).toBe(true);
  });

  it('createUser → updateUser → deleteUser flujo completo', async () => {
    const created = await adminService.createUser({
      id_rol: 2,
      nombre_apellido: 'Nuevo Usuario',
      email: 'nuevo@test.com',
      password: 'Abcd1234',
      telefono: '3001112233',
    });
    expect(created.name).toBe('Nuevo Usuario');
    expect(created.id).toBe('101');

    const updated = await adminService.updateUser('101', {
      nombre_apellido: 'Usuario Actualizado',
    });
    expect(updated.id).toBe('101');

    await adminService.deleteUser('101');
    expect(mockedClient.api.delete).toHaveBeenCalledWith('/admin/usuarios/101');
  });

  it('listAllCategories retorna categorías mapeadas', async () => {
    const categories = await adminService.listAllCategories();
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Tecnología');
    expect(categories[0].active).toBe(true);
  });

  it('createCategory → updateCategory → deleteCategory', async () => {
    const created = await adminService.createCategory({
      nombre: 'Nueva Categoría',
      descripcion: 'Descripción',
      estado: '1',
    });
    expect(created.name).toBe('Nueva Categoría');

    const updated = await adminService.updateCategory('101', {
      nombre: 'Categoría Actualizada',
      descripcion: 'Actualizada',
      estado: '1',
    });
    expect(updated.id).toBe('101');

    await adminService.deleteCategory('101');
    expect(mockedClient.api.delete).toHaveBeenCalled();
  });

  it('listAllSuppliers retorna proveedores mapeados', async () => {
    const suppliers = await adminService.listAllSuppliers();
    expect(suppliers).toHaveLength(1);
    expect(suppliers[0].name).toBe('TechCorp S.A.S');
    expect(suppliers[0].nit).toBe('900123456');
    expect(suppliers[0].active).toBe(true);
  });

  it('createSupplier → updateSupplier → deleteSupplier', async () => {
    const created = await adminService.createSupplier({
      nit_proveedor: '900999999',
      razon_social: 'Nuevo Proveedor',
      telefono: '3009999999',
      email: 'nuevo@proveedor.com',
    });
    expect(created.name).toBe('Nuevo Proveedor');

    await adminService.updateSupplier('101', {
      nit_proveedor: '900999999',
      razon_social: 'Proveedor Actualizado',
      telefono: '3009999999',
      email: 'actualizado@proveedor.com',
    });
    expect(mockedClient.api.put).toHaveBeenCalled();

    await adminService.deleteSupplier('101');
    expect(mockedClient.api.delete).toHaveBeenCalled();
  });

  it('listDriversAdmin retorna repartidores mapeados', async () => {
    const drivers = await adminService.listDriversAdmin();
    expect(drivers).toHaveLength(1);
    expect(drivers[0].name).toBe('Pedro Repartidor');
    expect(drivers[0].status).toBe('DISPONIBLE');
    expect(drivers[0].deliveriesToday).toBe(3);
  });

  it('createDriver → updateDriver → deleteDriver', async () => {
    await adminService.createDriver({
      nombre_apellido: 'Nuevo Repartidor',
      email: 'repartidor@nexbit.com',
      password: 'Abcd1234',
      telefono: '3005556677',
    });
    expect(mockedClient.api.post).toHaveBeenCalledWith('/admin/repartidores', expect.any(Object));

    await adminService.updateDriver('1', { nombre_apellido: 'Repartidor Actualizado' });
    expect(mockedClient.api.put).toHaveBeenCalled();

    await adminService.deleteDriver('1');
    expect(mockedClient.api.delete).toHaveBeenCalled();
  });

  it('listRoles retorna roles mapeados', async () => {
    const roles = await adminService.listRoles();
    expect(roles).toHaveLength(1);
    expect(roles[0].name).toBe('Administrador');
    expect(roles[0].description).toBe('Acceso total al sistema');
  });

  it('createRole → updateRole', async () => {
    const created = await adminService.createRole({
      name: 'Nuevo Rol',
      description: 'Rol de prueba',
    });
    expect(created.name).toBe('Nuevo Rol');

    const updated = await adminService.updateRole(String(created.id), {
      name: 'Rol Actualizado',
      description: 'Actualizado',
    });
    expect(updated.id).toBe(String(created.id));
  });

  it('getAnalyticsSummary retorna datos de analítica', async () => {
    const analytics = await adminService.getAnalyticsSummary();
    expect(analytics.kpis).toHaveLength(1);
    expect(analytics.kpis[0].titulo).toBe('Ventas Hoy');
    expect(analytics.kpis[0].valor).toBe(1500000);
  });

  it('flujo admin completo: listar usuarios → crear categoría → ver analytics', async () => {
    const users = await adminService.listUsers();
    expect(users.length).toBeGreaterThan(0);

    const category = await adminService.createCategory({
      nombre: 'Test Category',
      descripcion: 'Test',
      estado: '1',
    });
    expect(category.name).toBe('Test Category');

    const analytics = await adminService.getAnalyticsSummary();
    expect(analytics.kpis).toBeDefined();
  });
});
