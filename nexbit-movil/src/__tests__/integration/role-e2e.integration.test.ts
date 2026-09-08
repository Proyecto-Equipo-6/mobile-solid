/**
 * Prueba End-to-End por Rol
 *
 * Simula el recorrido completo de la plataforma por cada rol usando una
 * "base de datos" en memoria compartida entre los mocks, de modo que los
 * flujos se encadenan entre roles (el admin crea productos que el cliente
 * ve, el pedido del cliente lo gestiona el repartidor y el admin).
 *
 * Rol Cliente:   registrar → login → catálogo → carrito → pedido → perfil
 * Rol Repartidor: login → dashboard → iniciar entrega → comprobante → entregar
 * Rol Admin:      login → analytics → crear producto/categoría/usuario
 *                 → asignar repartidor → entregar con evidencia
 */

import { render, act, cleanup } from '@testing-library/react-native';
import React from 'react';

import { CartProvider, useCart } from '@/features/cart/hooks/CartProvider';
import * as orderService from '@/features/cart/services/order.service';
import * as catalogService from '@/features/catalog/services/catalog.service';
import * as deliveryService from '@/features/delivery/services/delivery.service';
import * as authService from '@/features/auth/services/auth.service';
import * as profileService from '@/features/auth/services/profile.service';
import * as adminService from '@/features/admin-panel/services/admin.service';

jest.mock('@/shared/api/client');

const mockedClient = jest.mocked(require('@/shared/api/client'));

type Usuario = {
  id_usuario: number;
  id_rol: number;
  nombre_apellido: string;
  email: string;
  password: string;
  telefono: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  activo: number;
};

type Producto = {
  id_producto: number;
  sku: string;
  id_categoria: number;
  id_proveedor: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  estado: number;
  imagen_url: string | null;
};

type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  estado: number;
};

type Pedido = {
  id_pedido: number;
  id_usuario: number;
  id_repartidor: number | null;
  id_metodo_pago: number;
  direccion_entrega: string;
  total: number;
  estado: string;
  comprobante_url: string | null;
  observaciones: string | null;
  motivo_cancelacion: string | null;
  fecha_pedido: string;
  clienteNombre?: string;
  clienteTelefono?: string;
};

let usuarios: Usuario[] = [];
let productos: Producto[] = [];
let categorias: Categoria[] = [];
let pedidos: Pedido[] = [];
let sesion: { id_usuario: number; id_rol: number } | null = null;

function resetDB() {
  usuarios = [];
  productos = [];
  categorias = [];
  pedidos = [];
  sesion = null;
}

function siguienteId(lista: unknown[]): number {
  return lista.length + 1;
}

function usuarioSinPassword(u: Usuario) {
  const { password: _, ...resto } = u;
  return resto;
}

function pedidoSinInternos(p: Pedido) {
  const { id_repartidor: __, ...resto } = p;
  return resto;
}

// ---------------------------------------------------------------------------
// Mocks de la API
// ---------------------------------------------------------------------------

function mockGet(url: string) {
  // ---- Catálogo (cliente) ----
  if (url === '/productos/publico') {
    return Promise.resolve(productos.filter((p) => p.estado === 1));
  }
  if (url.startsWith('/productos/')) {
    const id = Number(url.split('/').pop());
    const producto = productos.find((p) => p.id_producto === id);
    if (!producto) return Promise.reject({ status: 404, message: 'Producto no encontrado' });
    return Promise.resolve(producto);
  }
  if (url === '/categorias') {
    return Promise.resolve(categorias.filter((c) => c.estado === 1));
  }

  // ---- Perfil / sesión ----
  if (url === '/users/perfil') {
    if (!sesion) return Promise.reject({ status: 401, message: 'No autenticado' });
    const usuario = usuarios.find((u) => u.id_usuario === sesion!.id_usuario);
    if (!usuario) return Promise.reject({ status: 404, message: 'Usuario no encontrado' });
    return Promise.resolve(usuarioSinPassword(usuario));
  }

  // ---- Carrito / pedidos cliente ----
  if (url === '/carrito') {
    return Promise.resolve({ items: [], total: 0 });
  }
  if (url === '/pedidos') {
    const misPedidos = pedidos
      .filter((p) => p.id_usuario === sesion?.id_usuario)
      .map(pedidoSinInternos);
    return Promise.resolve({ pedidos: misPedidos, vacio: misPedidos.length === 0 });
  }

  // ---- Repartidor ----
  if (url === '/repartidor/dashboard') {
    const activo = pedidos.find(
      (p) => p.id_repartidor === sesion?.id_usuario && ['ASIGNADO', 'EN_CAMINO'].includes(p.estado),
    );
    const enCola = pedidos.filter(
      (p) => p.id_repartidor === sesion?.id_usuario && p.estado === 'ASIGNADO' && p !== activo,
    );
    return Promise.resolve({
      conteoDelDia: pedidos.filter((p) => p.id_repartidor === sesion?.id_usuario).length,
      pedidoActivo: activo ?? null,
      pedidosEnCola: enCola,
    });
  }
  if (url.startsWith('/repartidor/pedidos/') && url.endsWith('/detalle')) {
    const id = Number(url.split('/').at(-2));
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    return Promise.resolve({
      ...pedido,
      productos: [
        { id_producto: productos[0].id_producto, nombre: productos[0].nombre, cantidad: 1, precio_unitario: productos[0].precio, subtotal: productos[0].precio },
      ],
    });
  }

  // ---- Admin ----
  if (url === '/productos') {
    return Promise.resolve(productos);
  }
  if (url === '/categorias/todas') {
    return Promise.resolve(categorias);
  }
  if (url === '/admin/repartidores') {
    const repartidores = usuarios
      .filter((u) => u.id_rol === 3)
      .map((u) => ({
        id_repartidor: u.id_usuario,
        nombre: u.nombre_apellido,
        telefono: u.telefono,
        email: u.email,
        estado: 'DISPONIBLE',
        pedidos_hoy: 0,
        pedidos_semana: 0,
        pedidos_mes: 0,
      }));
    return Promise.resolve(repartidores);
  }
  if (url === '/roles') {
    return Promise.resolve([
      { id: 1, name: 'Administrador', description: 'Acceso total' },
      { id: 2, name: 'Cliente', description: 'Cliente' },
      { id: 3, name: 'Repartidor', description: 'Repartidor' },
    ]);
  }
  if (url === '/analitica/resumen') {
    return Promise.resolve({
      kpis: [],
      ventasPorMes: [],
      pedidosPorEstado: [],
      productosMasVendidos: [],
      topClientes: [],
    });
  }
  if (url === '/admin/usuarios') {
    return Promise.resolve(usuarios.map(usuarioSinPassword));
  }
  if (url === '/proveedores' || url === '/proveedores/todos') {
    return Promise.resolve([
      { id_proveedor: 1, nit_proveedor: '900123456-7', razon_social: 'Proveedor Uno', telefono: '3000000001', email: 'prov1@test.com', estado: 1 },
    ]);
  }
  if (url.startsWith('/admin/pedidos')) {
    const parametros = new URLSearchParams(url.split('?')[1] ?? '');
    let lista = pedidos.slice();
    if (parametros.get('repartidor')) {
      lista = lista.filter((p) => p.id_repartidor === Number(parametros.get('repartidor')));
    }
    const data = lista.map((p) => {
      const cliente = usuarios.find((u) => u.id_usuario === p.id_usuario);
      return {
        ...p,
        clienteNombre: cliente?.nombre_apellido ?? '',
        clienteTelefono: cliente?.telefono ?? '',
      };
    });
    return Promise.resolve({ data, total: data.length, page: 1, limit: 100 });
  }

  return Promise.reject({ status: 404, message: 'Ruta no encontrada' });
}

function mockPost(url: string, body: unknown) {
  const b = body as Record<string, unknown>;

  if (url === '/users') {
    const usuario: Usuario = {
      id_usuario: siguienteId(usuarios),
      id_rol: 2,
      nombre_apellido: String(b.nombre_apellido),
      email: String(b.email),
      password: String(b.password),
      telefono: String(b.telefono),
      tipo_documento: String(b.tipo_documento ?? 'CC'),
      numero_documento: String(b.numero_documento ?? ''),
      direccion: String(b.direccion ?? ''),
      activo: 1,
    };
    usuarios.push(usuario);
    return Promise.resolve(usuario);
  }

  if (url === '/auth/login') {
    const { email, password } = b as { email: string; password: string };
    const usuario = usuarios.find(
      (u) => u.email === email && u.password === password && u.activo === 1,
    );
    if (!usuario) return Promise.reject({ status: 401, message: 'Credenciales inválidas' });
    sesion = { id_usuario: usuario.id_usuario, id_rol: usuario.id_rol };
    return Promise.resolve({ token: `jwt-${usuario.id_usuario}`, usuario: usuarioSinPassword(usuario) });
  }

  if (url === '/auth/logout') {
    sesion = null;
    return Promise.resolve({ mensaje: 'Sesión cerrada' });
  }

  if (url === '/carrito') {
    return Promise.resolve({ mensaje: 'Producto agregado' });
  }

  if (url === '/pedidos') {
    const payload = b as { direccionEntrega: string; observaciones?: string; idMetodoPago: number };
    const total = productos.reduce((acc, p) => acc + p.precio, 0);
    const pedido: Pedido = {
      id_pedido: siguienteId(pedidos),
      id_usuario: sesion!.id_usuario,
      id_repartidor: null,
      id_metodo_pago: payload.idMetodoPago,
      direccion_entrega: payload.direccionEntrega,
      total,
      estado: 'PENDIENTE',
      comprobante_url: null,
      observaciones: payload.observaciones ?? null,
      motivo_cancelacion: null,
      fecha_pedido: new Date().toISOString(),
    };
    pedidos.push(pedido);
    return Promise.resolve({ mensaje: 'Pedido creado', pedido });
  }

  if (url === '/productos') {
    const producto: Producto = {
      id_producto: siguienteId(productos),
      sku: String(b.sku),
      id_categoria: Number(b.id_categoria),
      id_proveedor: Number(b.id_proveedor),
      nombre: String(b.nombre),
      descripcion: String(b.descripcion ?? ''),
      precio: Number(b.precio),
      stock: Number(b.stock ?? 0),
      estado: b.estado === 0 ? 0 : 1,
      imagen_url: (b.imagen_url as string) ?? null,
    };
    productos.push(producto);
    return Promise.resolve(producto);
  }

  if (url === '/categorias') {
    const categoria: Categoria = {
      id_categoria: siguienteId(categorias),
      nombre: String(b.nombre),
      descripcion: String(b.descripcion ?? ''),
      estado: Number(b.estado ?? 1),
    };
    categorias.push(categoria);
    return Promise.resolve(categoria);
  }

  if (url === '/admin/usuarios') {
    const usuario: Usuario = {
      id_usuario: siguienteId(usuarios),
      id_rol: Number(b.id_rol),
      nombre_apellido: String(b.nombre_apellido),
      email: String(b.email),
      password: String(b.password),
      telefono: String(b.telefono),
      tipo_documento: String(b.tipo_documento ?? 'CC'),
      numero_documento: String(b.numero_documento ?? ''),
      direccion: String(b.direccion ?? ''),
      activo: 1,
    };
    usuarios.push(usuario);
    return Promise.resolve({ usuario: usuarioSinPassword(usuario) });
  }

  return Promise.reject({ status: 404, message: 'Ruta no encontrada' });
}

function mockPatch(url: string, body: unknown) {
  const b = body as Record<string, unknown>;
  const match = url.match(/\/pedidos\/(\d+)\/cancel/);
  if (match) {
    const id = Number(match[1]);
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    if (pedido.estado !== 'PENDIENTE') {
      return Promise.reject({ status: 400, message: 'Solo se puede cancelar en estado PENDIENTE' });
    }
    pedido.estado = 'CANCELADO';
    return Promise.resolve(pedido);
  }

  const estadoMatch = url.match(/\/repartidor\/pedidos\/(\d+)\/estado/);
  if (estadoMatch) {
    const id = Number(estadoMatch[1]);
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    const estado = String(b.estado);
    if (estado === 'ENTREGADO' && !b.comprobante_url) {
      return Promise.reject({ status: 400, message: 'La foto es obligatoria para confirmar la entrega' });
    }
    if (estado === 'NO_ENTREGADO' && !String(b.observacion ?? '').trim()) {
      return Promise.reject({ status: 400, message: 'La observación es obligatoria' });
    }
    pedido.estado = estado;
    pedido.comprobante_url = (b.comprobante_url as string) ?? pedido.comprobante_url;
    pedido.observaciones = (b.observaciones as string) ?? pedido.observaciones;
    return Promise.resolve(pedido);
  }

  return Promise.reject({ status: 404, message: 'Ruta no encontrada' });
}

function mockPut(url: string, body: unknown) {
  const b = body as Record<string, unknown>;

  if (url === '/users/perfil') {
    const usuario = usuarios.find((u) => u.id_usuario === sesion?.id_usuario);
    if (!usuario) return Promise.reject({ status: 404, message: 'Usuario no encontrado' });
    if (b.nombre_apellido !== undefined) usuario.nombre_apellido = String(b.nombre_apellido);
    if (b.telefono !== undefined) usuario.telefono = String(b.telefono);
    if (b.direccion !== undefined) usuario.direccion = String(b.direccion);
    return Promise.resolve(usuarioSinPassword(usuario));
  }

  if (url.startsWith('/admin/pedidos/') && url.endsWith('/asignar')) {
    const id = Number(url.split('/').at(-2));
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    pedido.id_repartidor = Number((b.id_repartidor as number));
    pedido.estado = 'ASIGNADO';
    const cliente = usuarios.find((u) => u.id_usuario === pedido!.id_usuario);
    return Promise.resolve({ ...pedido, clienteNombre: cliente?.nombre_apellido, clienteTelefono: cliente?.telefono });
  }

  if (url.startsWith('/admin/pedidos/') && url.endsWith('/estado')) {
    const id = Number(url.split('/').at(-2));
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    pedido.estado = String(b.estado);
    const cliente = usuarios.find((u) => u.id_usuario === pedido!.id_usuario);
    return Promise.resolve({ ...pedido, clienteNombre: cliente?.nombre_apellido, clienteTelefono: cliente?.telefono });
  }

  if (url.startsWith('/productos/')) {
    const id = Number(url.split('/').pop());
    const producto = productos.find((p) => p.id_producto === id);
    if (!producto) return Promise.reject({ status: 404, message: 'Producto no encontrado' });
    if (b.nombre !== undefined) producto.nombre = String(b.nombre);
    if (b.precio !== undefined) producto.precio = Number(b.precio);
    if (b.stock !== undefined) producto.stock = Number(b.stock);
    return Promise.resolve(producto);
  }

  return Promise.reject({ status: 404, message: 'Ruta no encontrada' });
}

function mockDelete(url: string) {
  if (url.startsWith('/productos/')) {
    const id = Number(url.split('/').pop());
    const producto = productos.find((p) => p.id_producto === id);
    if (producto) producto.estado = 0;
    return Promise.resolve(undefined);
  }
  return Promise.resolve(undefined);
}

function mockUpload(url: string) {
  if (url.includes('/comprobante')) {
    return Promise.resolve({ comprobante_url: 'https://cloudinary.test/comprobante.jpg' });
  }
  if (url.includes('/entregar')) {
    const id = Number(url.split('/').at(-2));
    const pedido = pedidos.find((p) => p.id_pedido === id);
    if (!pedido) return Promise.reject({ status: 404, message: 'Pedido no encontrado' });
    pedido.estado = 'ENTREGADO';
    pedido.comprobante_url = 'https://cloudinary.test/comprobante.jpg';
    const cliente = usuarios.find((u) => u.id_usuario === pedido!.id_usuario);
    return Promise.resolve({
      ...pedido,
      clienteNombre: cliente?.nombre_apellido ?? '',
      clienteTelefono: cliente?.telefono ?? '',
    });
  }
  if (url.includes('/productos/imagen')) {
    return Promise.resolve({ imagen_url: 'https://cloudinary.test/producto.jpg' });
  }
  return Promise.reject({ status: 404 });
}

// Semilla inicial: un admin, un cliente, un repartidor, un producto y un
// pedido asignado al repartidor, para que los flujos E2E tengan datos.
function seedDB() {
  usuarios = [
    {
      id_usuario: 1,
      id_rol: 1,
      nombre_apellido: 'Admin Sistema',
      email: 'admin@test.com',
      password: 'Abcd1234',
      telefono: '3000000000',
      tipo_documento: 'CC',
      numero_documento: '1000000000',
      direccion: 'Oficina 1',
      activo: 1,
    },
    {
      id_usuario: 2,
      id_rol: 3,
      nombre_apellido: 'Repartidor Uno',
      email: 'repartidor@test.com',
      password: 'Abcd1234',
      telefono: '3001112222',
      tipo_documento: 'CC',
      numero_documento: '1000000003',
      direccion: 'Bodega 1',
      activo: 1,
    },
  ];

  categorias = [
    { id_categoria: 1, nombre: 'Tecnología', descripcion: 'Dispositivos', estado: 1 },
  ];

  productos = [
    {
      id_producto: 1,
      sku: 'NEX-000',
      id_categoria: 1,
      id_proveedor: 1,
      nombre: 'Laptop Gamer',
      descripcion: '16GB RAM',
      precio: 3500000,
      stock: 5,
      estado: 1,
      imagen_url: null,
    },
  ];

  pedidos = [
    {
      id_pedido: 1,
      id_usuario: 2,
      id_repartidor: 2,
      id_metodo_pago: 1,
      direccion_entrega: 'Calle 10 #5-20',
      total: 3500000,
      estado: 'ASIGNADO',
      comprobante_url: null,
      observaciones: null,
      motivo_cancelacion: null,
      fecha_pedido: '2026-01-15T10:00:00.000Z',
    },
    {
      id_pedido: 2,
      id_usuario: 2,
      id_repartidor: 2,
      id_metodo_pago: 1,
      direccion_entrega: 'Carrera 5 #15-30',
      total: 2500000,
      estado: 'ASIGNADO',
      comprobante_url: null,
      observaciones: null,
      motivo_cancelacion: null,
      fecha_pedido: '2026-01-16T10:00:00.000Z',
    },
  ];
}

beforeEach(() => {
  jest.clearAllMocks();
  resetDB();
  seedDB();
  mockedClient.api = {
    get: jest.fn(mockGet),
    post: jest.fn(mockPost),
    put: jest.fn(mockPut),
    patch: jest.fn(mockPatch),
    delete: jest.fn(mockDelete),
    upload: jest.fn(mockUpload),
  };
  mockedClient.setAuthToken = jest.fn();
  mockedClient.getAuthToken = jest.fn(() => null);
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Helpers de render para el carrito (cliente)
// ---------------------------------------------------------------------------

let latestCart: ReturnType<typeof useCart> | null = null;

function CartBridge() {
  latestCart = useCart();
  return null as unknown as React.ReactElement;
}

function renderCart() {
  latestCart = null;
  return act(async () => {
    render(
      React.createElement(
        CartProvider,
        null,
        React.createElement(CartBridge),
      ),
    );
  });
}

describe('E2E — Rol Cliente', () => {
  it('recorre registro → login → catálogo → carrito → pedido → perfil → logout', async () => {
    // 1. Registro
    const registrado = await authService.register({
      nombre_apellido: 'Cliente Uno',
      tipo_documento: 'CC',
      numero_documento: '1000000001',
      email: 'cliente@test.com',
      password: 'Abcd1234',
      telefono: '3001234567',
      direccion: 'Calle 10',
    });
    expect(registrado.email).toBe('cliente@test.com');
    expect(registrado.role).toBe('client');

    // 2. Login
    const usuarioSesion = await authService.login({
      email: 'cliente@test.com',
      password: 'Abcd1234',
    });
    expect(usuarioSesion.email).toBe('cliente@test.com');
    expect(usuarioSesion.role).toBe('client');

    // 3. Catálogo (admin creó previamente el producto)
    const catalogo = await catalogService.listProducts();
    expect(catalogo.length).toBeGreaterThan(0);

    const detalle = await catalogService.getProduct(String(productos[0].id_producto));
    expect(detalle.name).toBe(productos[0].nombre);

    // 4. Carrito (en memoria)
    await renderCart();
    await act(async () => {
      latestCart!.addItem({
        productId: detalle.id,
        name: detalle.name,
        price: detalle.price,
        stock: detalle.stock,
      });
    });
    expect(latestCart!.items).toHaveLength(1);
    expect(latestCart!.items[0].quantity).toBe(1);

    // 5. Crear pedido
    const pedido = await orderService.createOrder(
      {
        direccionEntrega: 'Calle 10 #5-20, Medellín',
        observaciones: 'Entregar en portería',
        idMetodoPago: 1,
      },
      latestCart!.items,
    );
    expect(pedido.id).toBe(String(pedidos[pedidos.length - 1].id_pedido));
    expect(pedido.status).toBe('pending');

    // 6. Ver mis pedidos
    const misPedidos = await orderService.listMyOrders();
    expect(misPedidos).toHaveLength(1);
    expect(misPedidos[0].id).toBe(pedido.id);

    // 7. Editar perfil
    const perfilActualizado = await profileService.updateMyProfile({
      nombre_apellido: 'Cliente Uno Actualizado',
      telefono: '3009999999',
      direccion: 'Carrera 20 #10-30',
    });
    expect(perfilActualizado.name).toBe('Cliente Uno Actualizado');
    expect(perfilActualizado.phone).toBe('3009999999');

    const perfil = await profileService.getMyProfile();
    expect(perfil.name).toBe('Cliente Uno Actualizado');

    // 8. Logout
    await authService.logout();
    await expect(authService.refreshAuth()).rejects.toMatchObject({ status: 401 });

    cleanup();
  });

  it('cancela un pedido solo en estado PENDIENTE', async () => {
    await authService.register({
      nombre_apellido: 'Cliente Dos',
      tipo_documento: 'CC',
      numero_documento: '1000000002',
      email: 'cliente2@test.com',
      password: 'Abcd1234',
      telefono: '3000000002',
      direccion: 'Calle 2',
    });
    await authService.login({ email: 'cliente2@test.com', password: 'Abcd1234' });

    // Crear pedido (queda PENDIENTE)
    const pedido = await orderService.createOrder(
      { direccionEntrega: 'Calle 2', idMetodoPago: 1 },
      [{ productId: String(productos[0].id_producto), name: productos[0].nombre, price: productos[0].precio, quantity: 1, stock: productos[0].stock }],
    );

    // Cancelar en PENDIENTE → OK
    const cancelado = await orderService.cancelOrder(pedido.id);
    expect(cancelado.status).toBe('cancelled');

    // Intentar cancelar de nuevo (ya no es PENDIENTE) → error
    await expect(orderService.cancelOrder(pedido.id)).rejects.toMatchObject({ status: 400 });
  });
});

describe('E2E — Rol Repartidor', () => {
  it('recorre login → dashboard → iniciar entrega → subir comprobante → entregar', async () => {
    // Admin asignó un pedido al repartidor (id_rol 3)
    const repartidor = usuarios.find((u) => u.id_rol === 3);
    expect(repartidor).toBeDefined();
    const pedidoAsignado = pedidos.find((p) => p.id_repartidor === repartidor!.id_usuario);
    expect(pedidoAsignado).toBeDefined();

    // 1. Login como repartidor
    const usuarioSesion = await authService.login({
      email: repartidor!.email,
      password: repartidor!.password,
    });
    expect(usuarioSesion.role).toBe('driver');

    // 2. Dashboard
    const dashboard = await deliveryService.getDashboard();
    expect(dashboard.conteoDelDia).toBeGreaterThanOrEqual(1);
    expect(dashboard.pedidoActivo).not.toBeNull();

    // 3. Detalle del pedido activo
    const detalle = await deliveryService.getOrderDetail(dashboard.pedidoActivo!.id);
    expect(detalle.id).toBe(String(pedidoAsignado!.id_pedido));
    expect(detalle.products?.length).toBeGreaterThan(0);

    // 4. Iniciar entrega (ASIGNADO → EN_CAMINO)
    await deliveryService.updateDeliveryStatus(detalle.id, 'EN_CAMINO', 'ASIGNADO');

    // 5. Subir comprobante (foto de evidencia)
    const url = await deliveryService.subirComprobante(detalle.id, {
      uri: 'file:///tmp/entrega.jpg',
      mimeType: 'image/jpeg',
      fileSize: 512000,
    });
    expect(url).toBeTruthy();

    // 6. Entregar (EN_CAMINO → ENTREGADO con comprobante)
    const entregado = await deliveryService.entregarPedido(detalle.id, url);
    expect(entregado.status).toBe('delivered');
    expect(entregado.estadoRaw).toBe('ENTREGADO');
  });

  it('registra "No entregado" con observación obligatoria', async () => {
    const repartidor = usuarios.find((u) => u.id_rol === 3);
    const pedidoCola = pedidos.find(
      (p) => p.id_repartidor === repartidor!.id_usuario && p.estado === 'ASIGNADO',
    );
    expect(pedidoCola).toBeDefined();

    await authService.login({ email: repartidor!.email, password: repartidor!.password });

    const dashboard = await deliveryService.getDashboard();
    expect(dashboard.pedidosEnCola.length).toBeGreaterThan(0);

    // Marcar no entregado con observación
    const noEntregado = await deliveryService.marcarNoEntregado(
      String(pedidoCola!.id_pedido),
      'Cliente no se encontraba en el lugar',
    );
    expect(noEntregado.status).toBe('not_delivered');

    // Sin observación → el backend rechaza
    await expect(
      deliveryService.updateDeliveryStatus(String(pedidoCola!.id_pedido), 'NO_ENTREGADO', 'EN_CAMINO', { observacion: '' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('E2E — Rol Admin', () => {
  it('recorre login → analytics → crear producto/categoría/usuario → asignar → entregar', async () => {
    // 1. Login como admin (usuario id_rol 1 creado en la semilla)
    const admin = usuarios.find((u) => u.id_rol === 1);
    expect(admin).toBeDefined();
    const usuarioSesion = await authService.login({ email: admin!.email, password: admin!.password });
    expect(usuarioSesion.role).toBe('admin');

    // 2. Crear categoría
    const categoria = await adminService.createCategory({
      nombre: 'Electrodomésticos',
      descripcion: 'Línea blanca',
      estado: '1',
    });
    expect(categoria.id).toBeTruthy();

    // 3. Crear producto con categoría y proveedor
    const producto = await adminService.createProduct({
      sku: 'NEX-001',
      categoryId: String(categoria.id),
      supplierId: '1',
      name: 'Nevera 300L',
      description: 'Nevera eficiente',
      price: 2500000,
      stock: 10,
      available: true,
    });
    expect(producto.name).toBe('Nevera 300L');
    expect(producto.stock).toBe(10);

    // 4. Crear usuario cliente y repartidor
    const cliente = await adminService.createUser({
      id_rol: 2,
      nombre_apellido: 'Cliente Admin',
      email: 'cliente.admin@test.com',
      password: 'Abcd1234',
      telefono: '3001234567',
    });
    expect(cliente.id).toBeTruthy();

    const repartidor = await adminService.createUser({
      id_rol: 3,
      nombre_apellido: 'Repartidor Uno',
      email: 'repartidor.uno@test.com',
      password: 'Abcd1234',
      telefono: '3005556677',
    });
    expect(repartidor.id).toBeTruthy();

    // 5. Ver analytics
    const analytics = await adminService.getAnalyticsSummary();
    expect(analytics).toBeDefined();

    // 6. El cliente crea un pedido (se simula con la sesión del cliente)
    await authService.login({ email: 'cliente.admin@test.com', password: 'Abcd1234' });
    const pedido = await orderService.createOrder(
      { direccionEntrega: 'Calle 99', idMetodoPago: 1 },
      [{ productId: String(producto.id), name: producto.name, price: producto.price, quantity: 1, stock: producto.stock }],
    );

    // 7. Volver a admin y asignar repartidor
    await authService.login({ email: admin!.email, password: admin!.password });
    const asignado = await adminService.assignOrder(pedido.id, repartidor.id);
    expect(asignado.status).toBe('assigned');
    expect(asignado.driverId).toBe(repartidor.id);

    // 8. Listar pedidos y repartidores
    const pedidosAdmin = await adminService.listAdminOrders();
    expect(pedidosAdmin.length).toBeGreaterThan(0);
    const drivers = await adminService.listDriversAdmin();
    expect(drivers.some((d) => d.id === repartidor.id)).toBe(true);

    // 9. Entregar con evidencia fotográfica (admin)
    const entregado = await adminService.deliverOrderWithEvidence(
      pedido.id,
      { uri: 'file:///tmp/evidencia.jpg', mimeType: 'image/jpeg' },
      'Entregado en recepción',
    );
    expect(entregado.status).toBe('delivered');
    expect(entregado.estadoRaw).toBe('ENTREGADO');

    // 10. Verificar historial del repartidor
    const historial = await adminService.listDriverOrders(repartidor.id);
    expect(historial.some((o) => o.id === pedido.id)).toBe(true);
    expect(historial.find((o) => o.id === pedido.id)?.estadoRaw).toBe('ENTREGADO');
  });
});