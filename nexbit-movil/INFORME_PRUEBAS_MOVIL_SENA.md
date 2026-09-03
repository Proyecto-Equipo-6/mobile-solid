# Informe de Pruebas — Sistema Comercial NexBit

| Campo | Valor |
|-------|-------|
| Proyecto | NexBit — Sistema Comercial (Móvil + Backend) |
| Fecha | 2026-08-30 |
| Total suites | 49 (27 backend + 22 móvil) |
| Total pruebas | 396 (203 integración + 193 móvil) |
| Estado | Todas pasan ✓ |

---

## 1. Resumen General

| Capa | Tipo de Prueba | Suites | Pruebas | Herramienta |
|------|---------------|--------|---------|-------------|
| Backend | Prueba de Integración / Jest + InMemory Repository | 27 | 203 | Jest 30.4.2 + bcrypt + jsonwebtoken |
| Móvil | Unit Test + Integration Test / Jest + jest-expo | 22 | 193 | Jest 29.7.0 + jest-expo 57.0.4 + @testing-library/react-native 14.x |
| **Total** | | **49** | **396** | |

---

## 2. Pruebas de Integración — Backend (203 pruebas)

Las pruebas de integración del backend validan la interacción completa entre **Casos de Uso**, **Repositorios InMemory** y **Lógica de Negocio**, sin dependencia de base de datos externa. Cada prueba instancia repositorios en memoria, inyecta casos de uso, y verifica el resultado completo del flujo.

### 2.1 Cobertura por Caso de Uso

| CU | Descripción | Archivo de Prueba | Pruebas |
|----|-------------|-------------------|---------|
| CU-001 | Visualizar Catálogo | CU-001-VisualizarCatalogo.test.js | 17 |
| CU-002 | Registrar Cuenta | CU-002-RegistrarCuenta.test.js | 11 |
| CU-003 | Iniciar Sesión | CU-003-IniciarSesion.test.js | 8 |
| CU-004 | Visualizar Perfil | CU-004-VisualizarPerfil.test.js | 4 |
| CU-005 | Editar Perfil | CU-005-EditarPerfil.test.js | 10 |
| CU-006 | Recuperar Contraseña | CU-006-RecuperarContrasena.test.js | 9 |
| CU-007 | Cerrar Sesión | CU-007-CerrarSesion.test.js | 4 |
| CU-008 | Actualizar Carrito | CU-008-ActualizarCarrito.test.js | 8 |
| CU-009 | Eliminar del Carrito | CU-009-EliminarDelCarrito.test.js | 6 |
| CU-010 | Agregar al Carrito | CU-010-AgregarAlCarrito.test.js | 8 |
| CU-011 | Ver Carrito | CU-011-VerCarrito.test.js | 4 |
| CU-012 | Crear Pedido | CrearPedidoUseCase.test.js | 8 |
| CU-013 | Ver Pedidos | CU-013-VerPedidos.test.js | 5 |
| CU-014 | Cancelar Pedido | CU-014-CancelarPedido.test.js | 5 |
| CU-015 | Dashboard del Repartidor | verDashboardPedidos.test.js | 4 |
| CU-016 | Detalle de Pedido (Repartidor) | verDetallePedido.test.js | 4 |
| CU-017 | Historial de Pedidos (Repartidor) | verHistorialPedidos.test.js | 4 |
| CU-018 | Actualizar Estado de Pedido | actualizarEstadoPedido.test.js | 6 |
| CU-019 | Estado Operativo del Repartidor | repartidorEstadoOperativo.test.js | 2 |
| CU-020 | Consultar Repartidores (Admin) | consultarRepartidores.test.js | 6 |
| CU-022 | Gestionar Categorías (Admin) | categoria.test.js | 5 |
| CU-023 | Ajustar Stock (Admin) | ajustarStock.test.js | 5 |
| CU-024 | Gestionar Roles (Admin) | CU-024-GestionRoles.test.js | 9 |
| CU-025 | Gestionar Proveedores (Admin) | proveedor.test.js | 9 |
| CU-026 | CRUD Usuarios (Admin) | CU-026-CRUDUsuarios.test.js | 13 |
| CU-027 | Gestión de Pedidos (Admin) | pedidoAdmin.test.js | 19 |
| CU-028 | Gestión de Productos (Admin) | producto.test.js | 10 |
| **Total** | | **27 archivos** | **203** |

### 2.2 Detalle por Caso de Uso

#### CU-001: Visualizar Catálogo (17 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-001-01 | Lista productos públicos disponibles | Retorna solo productos con estado=1 |
| CP-BE-001-02 | Filtra por categoría | Retorna solo productos de la categoría seleccionada |
| CP-BE-001-03 | Busca productos por nombre | Retorna productos que coinciden con el término de búsqueda |
| CP-BE-001-04 | Retorna array vacío sin productos | Retorna lista vacía cuando no hay productos |
| CP-BE-001-05 | Obtiene detalle de producto por ID | Retorna producto completo con categoría y proveedor |
| CP-BE-001-06 | Retorna 404 para producto inexistente | Lanza error con status 404 |
| CP-BE-001-07 | Lista categorías activas | Retorna solo categorías con estado=1 |
| CP-BE-001-08 | Filtra categorías inactivas | Excluye categorías con estado=0 |
| CP-BE-001-09 | Lista todos los productos (admin) | Retorna productos con información completa |
| CP-BE-001-10 | Paginación de productos | Retorna página correcta con límite configurado |
| CP-BE-001-11 | Búsqueda con término vacío | Retorna todos los productos |
| CP-BE-001-12 | Producto con stock cero | Retorna producto con stock=0 |
| CP-BE-001-13 | Múltiples categorías | Maneja productos de diferentes categorías |
| CP-BE-001-14 | Producto sin proveedor | Maneja productos sin proveedor asignado |
| CP-BE-001-15 | Ordenamiento por precio | Retorna productos ordenados por precio |
| CP-BE-001-16 | Límite de resultados | Respeta el límite de productos por página |
| CP-BE-001-17 | Error de conexión a BD | Maneja errores del repositorio |

#### CU-002: Registrar Cuenta (11 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-002-01 | Registro exitoso con datos válidos | Crea usuario y retorna id + token |
| CP-BE-002-02 | Rechaza email duplicado | Lanza error 409 |
| CP-BE-002-03 | Rechaza campos obligatorios faltantes | Lanza error 400 |
| CP-BE-002-04 | Valida formato de email | Lanza error 400 |
| CP-BE-002-05 | Valida longitud de contraseña | Lanza error 400 |
| CP-BE-002-06 | Valida tipo de documento | Lanza error 400 |
| CP-BE-002-07 | Hashea la contraseña | Contraseña no se almacena en texto plano |
| CP-BE-002-08 | Asigna rol por defecto (cliente) | id_rol = 2 |
| CP-BE-002-09 | Crea carrito vacío asociado | Carrito existe para el nuevo usuario |
| CP-BE-002-10 | Rechaza documento duplicado | Lanza error 409 |
| CP-BE-002-11 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-003: Iniciar Sesión (8 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-003-01 | Login exitoso con credenciales válidas | Retorna token JWT + usuario sin password |
| CP-BE-003-02 | Rechaza contraseña incorrecta | Lanza error 401 |
| CP-BE-003-03 | Rechaza correo no registrado | Lanza error 401 |
| CP-BE-003-04 | Rechaza campos faltantes | Lanza error 401 |
| CP-BE-003-05 | Rechaza cuenta inactiva | Lanza error 403 |
| CP-BE-003-06 | Maneja error de conexión a BD | Maneja errores del repositorio |
| CP-BE-003-07 | Token JWT expira después de 30 min | Verifica expiración del token |
| CP-BE-003-08 | Retorna id_rol para redireccionamiento | Incluye id_rol en el payload |

#### CU-004: Visualizar Perfil (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-004-01 | Obtiene perfil del usuario autenticado | Retorna datos del usuario sin password |
| CP-BE-004-02 | Rechaza usuario no autenticado | Lanza error 401 |
| CP-BE-004-03 | Rechaza usuario inexistente | Lanza error 404 |
| CP-BE-004-04 | Excluye campo password | Password no aparece en la respuesta |

#### CU-005: Editar Perfil (10 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-005-01 | Actualiza nombre exitosamente | Cambia nombre_apellido |
| CP-BE-005-02 | Actualiza teléfono | Cambia telefono |
| CP-BE-005-03 | Actualiza dirección | Cambia direccion |
| CP-BE-005-04 | Actualiza email | Cambia email |
| CP-BE-005-05 | Rechaza email duplicado | Lanza error 409 |
| CP-BE-005-06 | Rechaza campos vacíos | Lanza error 400 |
| CP-BE-005-07 | Rechaza usuario no autenticado | Lanza error 401 |
| CP-BE-005-08 | Rechaza usuario inexistente | Lanza error 404 |
| CP-BE-005-09 | Valida formato de email | Lanza error 400 |
| CP-BE-005-10 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-006: Recuperar Contraseña (9 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-006-01 | Solicita reset exitosamente | Retorna mensaje de confirmación |
| CP-BE-006-02 | Rechaza email no registrado | Lanza error 404 |
| CP-BE-006-03 | Genera token de recuperación | Token se almacena en repositorio |
| CP-BE-006-04 | Restablece contraseña exitosamente | Actualiza password en BD |
| CP-BE-006-05 | Rechaza token inválido | Lanza error 400 |
| CP-BE-006-06 | Rechaza token expirado | Lanza error 400 |
| CP-BE-006-07 | Rechaza contraseña débil | Lanza error 400 |
| CP-BE-006-08 | Email no revela existencia | Mensaje genérico siempre |
| CP-BE-006-09 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-007: Cerrar Sesión (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-007-01 | Logout exitoso | Limpia cookie token |
| CP-BE-007-02 | Agrega token a lista negra | Token queda en blacklist |
| CP-BE-007-03 | Token en lista negra no autentica | Request con token revocado falla |
| CP-BE-007-04 | Logout sin token | Retorna éxito igualmente |

#### CU-008: Actualizar Carrito (8 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-008-01 | Actualiza cantidad exitosamente | Cambia cantidad del item |
| CP-BE-008-02 | Recalcula subtotal | Subtotal = precio × nueva cantidad |
| CP-BE-008-03 | Rechaza cantidad inválida | Lanza error 400 |
| CP-BE-008-04 | Rechaza cantidad negativa | Lanza error 400 |
| CP-BE-008-05 | Rechaza cantidad cero | Lanza error 400 |
| CP-BE-008-06 | Rechaza producto inexistente en carrito | Lanza error 404 |
| CP-BE-008-07 | Rechaza stock insuficiente | Lanza error 409 |
| CP-BE-008-08 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-009: Eliminar del Carrito (6 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-009-01 | Elimina producto exitosamente | Item se remueve del carrito |
| CP-BE-009-02 | Recalcula total | Total se actualiza |
| CP-BE-009-03 | Rechaza producto inexistente | Lanza error 404 |
| CP-BE-009-04 | Carrito vacío después de eliminar | Retorna carrito vacío |
| CP-BE-009-05 | No afecta otros productos | Solo elimina el producto indicado |
| CP-BE-009-06 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-010: Agregar al Carrito (8 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-010-01 | Agrega producto nuevo | Item se añade al carrito |
| CP-BE-010-02 | Rechaza stock insuficiente | Lanza error 409 |
| CP-BE-010-03 | No duplica producto, incrementa cantidad | Cantidad se suma |
| CP-BE-010-04 | Rechaza cantidad inválida | Lanza error 400 |
| CP-BE-010-05 | Rechaza producto inexistente | Lanza error 404 |
| CP-BE-010-06 | Maneja error de conexión | Maneja errores del repositorio |
| CP-BE-010-07 | Rechaza usuario sin sesión | Lanza error 400 |
| CP-BE-010-08 | Carrito persiste entre instancias | Misma datos después de recrear caso de uso |

#### CU-011: Ver Carrito (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-011-01 | Retorna carrito vacío | Items = [], total = 0 |
| CP-BE-011-02 | Retorna carrito con productos | Items con cantidad y subtotal |
| CP-BE-011-03 | Calcula total correctamente | Total = suma de subtotales |
| CP-BE-011-04 | Rechaza usuario sin sesión | Lanza error 400 |

#### CU-012: Crear Pedido (8 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-012-01 | Crea pedido exitosamente | Pedido con estado PENDIENTE |
| CP-BE-012-02 | Rechaza carrito vacío | Lanza error 400 |
| CP-BE-012-03 | Rechaza monto mínimo ($200.000) | Lanza error 400 |
| CP-BE-012-04 | Rechaza sin dirección de entrega | Lanza error 400 |
| CP-BE-012-05 | Rechaza usuario no autenticado | Lanza error 400 |
| CP-BE-012-06 | Calcula total del carrito | Total = suma de subtotales |
| CP-BE-012-07 | Rechaza stock insuficiente | Lanza error 409 |
| CP-BE-012-08 | Incluye observaciones en el pedido | Observaciones se guardan |

#### CU-013: Ver Pedidos (5 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-013-01 | Lista pedidos ordenados por fecha | Pedidos más recientes primero |
| CP-BE-013-02 | Muestra vista vacía | Retorna array vacío con mensaje |
| CP-BE-013-03 | Filtra por estado | Solo retorna pedidos del estado indicado |
| CP-BE-013-04 | Aislamiento por usuario | Solo ve sus propios pedidos |
| CP-BE-013-05 | Paginación server-side | Retorna página correcta |

#### CU-014: Cancelar Pedido (5 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-014-01 | Cancela pedido PENDIENTE | Estado cambia a CANCELADO |
| CP-BE-014-02 | Rechaza cancelar pedido EN_CAMINO | Lanza error 409 |
| CP-BE-014-03 | Rechaza cancelar pedido ENTREGADO | Lanza error 409 |
| CP-BE-014-04 | Rechaza cancelar pedido de otro usuario | Lanza error 403 |
| CP-BE-014-05 | Rechaza pedido inexistente | Lanza error 404 |

#### CU-015: Dashboard del Repartidor (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-015-01 | Retorna conteo del día | Número de entregas realizadas |
| CP-BE-015-02 | Retorna pedido activo | Detalle del pedido en curso |
| CP-BE-015-03 | Retorna pedidos en cola | Lista de pedidos pendientes |
| CP-BE-015-04 | Dashboard sin pedidos | Estructura vacía pero válida |

#### CU-016: Detalle de Pedido — Repartidor (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-016-01 | Retorna detalle completo | Producto, cantidad, precio |
| CP-BE-016-02 | Retorna dirección de entrega | Dirección formateada |
| CP-BE-016-03 | Retorna estado del pedido | Estado actual |
| CP-BE-016-04 | Rechaza pedido inexistente | Lanza error 404 |

#### CU-017: Historial de Pedidos — Repartidor (4 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-017-01 | Retorna historial completo | Lista de pedidos entregados |
| CP-BE-017-02 | Filtra por repartidor | Solo pedidos del repartidor actual |
| CP-BE-017-03 | Ordena por fecha descendente | Más recientes primero |
| CP-BE-017-04 | Retorna array vacío | Sin historial previo |

#### CU-018: Actualizar Estado de Pedido (6 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-018-01 | Cambia estado a EN_CAMINO | Estado actualiza correctamente |
| CP-BE-018-02 | Cambia estado a ENTREGADO | Estado actualiza correctamente |
| CP-BE-018-03 | Cambia estado a NO_ENTREGADO | Estado actualiza correctamente |
| CP-BE-018-04 | Rechaza transición inválida | Lanza error 409 |
| CP-BE-018-05 | Rechaza pedido inexistente | Lanza error 404 |
| CP-BE-018-06 | Guarda comprobante de entrega | URL se almacena |

#### CU-019: Estado Operativo del Repartidor (2 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-019-01 | Cambia estado a disponible | Repartidor queda activo |
| CP-BE-019-02 | Cambia estado a no disponible | Repartidor queda inactivo |

#### CU-020: Consultar Repartidores — Admin (6 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-020-01 | Lista todos los repartidores | Retorna array completo |
| CP-BE-020-02 | Filtra por estado activo | Solo repartidores activos |
| CP-BE-020-03 | Retorna repartidores disponibles | Sin pedido activo |
| CP-BE-020-04 | Crea repartidor nuevo | Repartidor se agrega a la lista |
| CP-BE-020-05 | Actualiza repartidor | Datos se modifican |
| CP-BE-020-06 | Elimina repartidor | Repartidor se remueve |

#### CU-022: Gestionar Categorías — Admin (5 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-022-01 | Lista todas las categorías | Retorna array completo |
| CP-BE-022-02 | Crea categoría nueva | Categoría se agrega |
| CP-BE-022-03 | Actualiza categoría | Nombre y descripción se modifican |
| CP-BE-022-04 | Elimina categoría | Categoría se remueve |
| CP-BE-022-05 | Rechaza categoría duplicada | Lanza error 409 |

#### CU-023: Ajustar Stock — Admin (5 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-023-01 | Aumenta stock | Stock incrementa |
| CP-BE-023-02 | Disminuye stock | Stock decrementa |
| CP-BE-023-03 | Rechaza stock negativo | Lanza error 400 |
| CP-BE-023-04 | Rechaza producto inexistente | Lanza error 404 |
| CP-BE-023-05 | Registra en historial | Movimiento se guarda |

#### CU-024: Gestionar Roles — Admin (9 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-024-01 | Lista todos los roles | Retorna array completo |
| CP-BE-024-02 | Crea rol nuevo | Rol se agrega |
| CP-BE-024-03 | Actualiza rol | Nombre se modifica |
| CP-BE-024-04 | Elimina rol | Rol se remueve |
| CP-BE-024-05 | Rechaza eliminar rol asignado | Lanza error 409 |
| CP-BE-024-06 | Rechaza rol duplicado | Lanza error 409 |
| CP-BE-024-07 | Rechaza nombre vacío | Lanza error 400 |
| CP-BE-024-08 | Rol predeterminado no eliminable | Lanza error 403 |
| CP-BE-024-09 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-025: Gestionar Proveedores — Admin (9 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-025-01 | Lista todos los proveedores | Retorna array completo |
| CP-BE-025-02 | Crea proveedor nuevo | Proveedor se agrega |
| CP-BE-025-03 | Actualiza proveedor | Datos se modifican |
| CP-BE-025-04 | Elimina proveedor | Proveedor se remueve |
| CP-BE-025-05 | Rechaza NIT duplicado | Lanza error 409 |
| CP-BE-025-06 | Rechaza campos obligatorios | Lanza error 400 |
| CP-BE-025-07 | Filtra proveedores activos | Solo retorna activos |
| CP-BE-025-08 | Cambia estado del proveedor | Activo/inactivo |
| CP-BE-025-09 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-026: CRUD Usuarios — Admin (13 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-026-01 | Lista todos los usuarios | Retorna array completo |
| CP-BE-026-02 | Filtra por estado | Solo activos o inactivos |
| CP-BE-026-03 | Filtra por rol | Solo usuarios del rol indicado |
| CP-BE-026-04 | Busca por nombre o email | Búsqueda parcial |
| CP-BE-026-05 | Crea usuario nuevo | Usuario se agrega |
| CP-BE-026-06 | Actualiza usuario | Datos se modifican |
| CP-BE-026-07 | Elimina usuario | Usuario se remueve |
| CP-BE-026-08 | Cambia estado del usuario | Activo/inactivo |
| CP-BE-026-09 | Rechaza email duplicado | Lanza error 409 |
| CP-BE-026-10 | Rechaza documento duplicado | Lanza error 409 |
| CP-BE-026-11 | Rechaza eliminar usuario con pedidos | Lanza error 409 |
| CP-BE-026-12 | Paginación | Retorna página correcta |
| CP-BE-026-13 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-027: Gestión de Pedidos — Admin (19 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-027-01 | Lista todos los pedidos | Retorna array completo |
| CP-BE-027-02 | Filtra por estado | Solo pedidos del estado indicado |
| CP-BE-027-03 | Filtra por fecha | Pedidos en rango de fechas |
| CP-BE-027-04 | Paginación | Retorna página correcta |
| CP-BE-027-05 | Detalle de pedido | Retorna pedido completo |
| CP-BE-027-06 | Asigna repartidor | Repartidor se vincula al pedido |
| CP-BE-027-07 | Rechaza asignar a repartidor inactivo | Lanza error 409 |
| CP-BE-027-08 | Confirma pedido | Estado cambia a CONFIRMADO |
| CP-BE-027-09 | Rechaza confirmar pedido ya confirmado | Lanza error 409 |
| CP-BE-027-10 | Cancela pedido | Estado cambia a CANCELADO |
| CP-BE-027-11 | Rechaza cancelar pedido EN_CAMINO | Lanza error 409 |
| CP-BE-027-12 | Desasigna repartidor | Repartidor se desvincula |
| CP-BE-027-13 | Entrega pedido con evidencia | Estado cambia a ENTREGADO |
| CP-BE-027-14 | Genera ticket de pedido | Ticket se crea |
| CP-BE-027-15 | Rechaza pedido inexistente | Lanza error 404 |
| CP-BE-027-16 | Rechaza repartidor inexistente | Lanza error 404 |
| CP-BE-027-17 | Devuelve stock al cancelar | Stock se restaura |
| CP-BE-027-18 | Filtra por repartidor | Solo pedidos del repartidor |
| CP-BE-027-19 | Maneja error de conexión | Maneja errores del repositorio |

#### CU-028: Gestión de Productos — Admin (10 pruebas)

| CP | Descripción | Prueba |
|----|-------------|--------|
| CP-BE-028-01 | Lista todos los productos | Retorna array completo |
| CP-BE-028-02 | Crea producto nuevo | Producto se agrega |
| CP-BE-028-03 | Actualiza producto | Datos se modifican |
| CP-BE-028-04 | Elimina producto | Producto se remueve |
| CP-BE-028-05 | Rechaza SKU duplicado | Lanza error 409 |
| CP-BE-028-06 | Rechaza categoría inexistente | Lanza error 404 |
| CP-BE-028-07 | Rechaza proveedor inexistente | Lanza error 404 |
| CP-BE-028-08 | Asigna imagen URL | URL se almacena |
| CP-BE-028-09 | Cambia estado del producto | Activo/inactivo |
| CP-BE-028-10 | Maneja error de conexión | Maneja errores del repositorio |

---

## 3. Pruebas Móvil (193 pruebas: 157 unitarias + 36 de integración)

Las pruebas del móvil validan la lógica de **servicios HTTP** (mapeo de datos, manejo de errores), **hooks de React** (estado, callbacks, ciclo de vida) y **flujos de integración** (interacción entre servicios), utilizando mocks para aislar las respuestas del backend.

### 3.1 Cobertura por Archivo

#### Unit Tests (17 archivos)

| Archivo | Pruebas | Módulo |
|---------|---------|--------|
| auth.service.test.ts | 15 | Autenticación |
| profile.service.test.ts | 4 | Perfil |
| catalog.service.test.ts | 9 | Catálogo |
| cart.service.test.ts | 7 | Carrito |
| order.service.test.ts | 13 | Pedidos |
| delivery.service.test.ts | 10 | Entregas |
| admin.service.test.ts | 31 | Administración |
| useAuth.test.ts | 8 | Autenticación |
| useProducts.test.ts | 4 | Catálogo |
| useCart.test.ts | 14 | Carrito |
| useDriverOrders.test.ts | 7 | Entregas |
| useAdminInventory.test.ts | 10 | Administración |
| useAdminUsers.test.ts | 5 | Administración |
| useAdminCategories.test.ts | 5 | Administración |
| useAdminSuppliers.test.ts | 5 | Administración |
| useAdminDrivers.test.ts | 5 | Administración |
| useAdminRoles.test.ts | 4 | Administración |
| **Subtotal** | **157** | |

#### Integration Tests (5 archivos)

| Archivo | Pruebas | Flujo verificado |
|---------|---------|------------------|
| auth-flow.integration.test.ts | 5 | register → login → perfil → actualizar → logout |
| cart-order-flow.integration.test.ts | 5 | addItem → totales → sincronizar → crearOrder → listarOrders |
| catalog-flow.integration.test.ts | 8 | listarProductos → listarCategorias → getProduct → wrappers |
| driver-flow.integration.test.ts | 6 | dashboard → detalle → entregar → noEntregado |
| admin-flow.integration.test.ts | 12 | CRUD usuarios/categorías/proveedores/repartidores/roles + analytics |
| **Subtotal** | **36** | |

| **Total Móvil** | **193** | **22 archivos** |

### 3.2 Detalle por Caso de Uso

#### CU-001: Login (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-001-01 | Login exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/login y retorna User mapeado |
| CP-MOB-001-02 | Login con credenciales inválidas | Unit Test / Jest | auth.service.test.ts | lanza error cuando las credenciales son inválidas |
| CP-MOB-001-03 | Login guarda token en memoria | Unit Test / Jest | auth.service.test.ts | guarda el token en memoria después del login |

#### CU-002: Registro (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-002-01 | Registro exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /users y retorna User mapeado |
| CP-MOB-002-02 | Registro autentica automáticamente | Unit Test / Jest | useAuth.test.ts | register exitoso llama login automáticamente |
| CP-MOB-002-03 | Registro con error no autentica | Unit Test / Jest | useAuth.test.ts | register con error no autentica al usuario |

#### CU-003: Recuperar Contraseña (5 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-003-01 | Solicitar reset exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/forgot-password con el email |
| CP-MOB-003-02 | Solicitar reset email no existe | Unit Test / Jest | auth.service.test.ts | lanza error cuando el email no existe |
| CP-MOB-003-03 | Reset password exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/reset-password con token y nueva contraseña |
| CP-MOB-003-04 | Reset password token inválido | Unit Test / Jest | auth.service.test.ts | lanza error cuando el token es inválido |
| CP-MOB-003-05 | Reset password token expirado | Unit Test / Jest | auth.service.test.ts | lanza error cuando el token ha expirado |

#### CU-004: Ver Perfil (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-004-01 | Obtener perfil exitoso | Unit Test / Jest | profile.service.test.ts | llama GET /users/perfil y retorna User mapeado |
| CP-MOB-004-02 | Obtener perfil error del servidor | Unit Test / Jest | profile.service.test.ts | lanza error cuando el servidor falla |

#### CU-005: Editar Perfil (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-005-01 | Actualizar perfil exitoso | Unit Test / Jest | profile.service.test.ts | llama PUT /users/perfil con los datos actualizados |
| CP-MOB-005-02 | Actualizar perfil datos inválidos | Unit Test / Jest | profile.service.test.ts | lanza error cuando los datos son inválidos |

#### CU-006: Cerrar Sesión (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-006-01 | Logout exitoso limpia token | Unit Test / Jest | auth.service.test.ts | llama POST /auth/logout y limpia el token |
| CP-MOB-006-02 | Logout limpia token aunque falle | Unit Test / Jest | auth.service.test.ts | limpia el token aunque el request falle |

#### CU-007: Ver Catálogo (12 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-007-01 | Listar productos exitoso | Unit Test / Jest | catalog.service.test.ts | retorna array de Product mapeados |
| CP-MOB-007-02 | Listar productos vacío | Unit Test / Jest | catalog.service.test.ts | retorna array vacío |
| CP-MOB-007-03 | Listar productos con wrapper items | Unit Test / Jest | catalog.service.test.ts | maneja wrapper { items: [...] } |
| CP-MOB-007-04 | Listar productos con wrapper productos | Unit Test / Jest | catalog.service.test.ts | maneja wrapper { productos: [...] } |
| CP-MOB-007-05 | Listar productos error servidor | Unit Test / Jest | catalog.service.test.ts | lanza error cuando el servidor falla |
| CP-MOB-007-06 | Listar categorías activas | Unit Test / Jest | catalog.service.test.ts | retorna categorías activas mapeadas |
| CP-MOB-007-07 | Filtrar categorías inactivas | Unit Test / Jest | catalog.service.test.ts | filtra categorías inactivas |
| CP-MOB-007-08 | Listar categorías con wrapper | Unit Test / Jest | catalog.service.test.ts | maneja wrapper { categorias: [...] } |
| CP-MOB-007-09 | Hook useProducts carga datos | Unit Test / Jest | useProducts.test.ts | carga productos y categorías al montar |
| CP-MOB-007-10 | Hook useProducts maneja error | Unit Test / Jest | useProducts.test.ts | maneja error al cargar catálogo |
| CP-MOB-007-11 | Hook useProducts filtra por categoría | Unit Test / Jest | useProducts.test.ts | filtra productos por categoría |
| CP-MOB-007-12 | Hook useProducts recarga datos | Unit Test / Jest | useProducts.test.ts | reload recarga los datos |

#### CU-008: Ver Detalle Producto (1 prueba — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-008-01 | Obtener producto por ID | Unit Test / Jest | catalog.service.test.ts | retorna un Product mapeado por ID |

#### CU-009: Agregar al Carrito (6 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-009-01 | Agregar producto nuevo | Unit Test / Jest | useCart.test.ts | addItem agrega un producto al carrito |
| CP-MOB-009-02 | Agregar producto duplicado | Unit Test / Jest | useCart.test.ts | addItem incrementa cantidad |
| CP-MOB-009-03 | Agregar recalcula totales | Unit Test / Jest | useCart.test.ts | addItem recalcula count y totales |
| CP-MOB-009-04 | Servicio agregarAlCarrito exitoso | Unit Test / Jest | cart.service.test.ts | llama POST /carrito |
| CP-MOB-009-05 | Servicio agregarAlCarrito cantidad custom | Unit Test / Jest | cart.service.test.ts | llama POST /carrito con cantidad personalizada |
| CP-MOB-009-06 | Servicio agregarAlCarrito producto no existe | Unit Test / Jest | cart.service.test.ts | lanza error cuando el producto no existe |

#### CU-010: Ver Carrito (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-010-01 | Carrito inicia vacío | Unit Test / Jest | useCart.test.ts | inicia con carrito vacío |
| CP-MOB-010-02 | Servicio verCarrito exitoso | Unit Test / Jest | cart.service.test.ts | llama GET /carrito |
| CP-MOB-010-03 | Carrito calcula totales con delivery fee | Unit Test / Jest | useCart.test.ts | calcula totales correctamente |

#### CU-011: Actualizar Cantidad (5 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-011-01 | Actualizar cantidad exitoso | Unit Test / Jest | useCart.test.ts | updateQuantity actualiza la cantidad |
| CP-MOB-011-02 | Cantidad 0 elimina producto | Unit Test / Jest | useCart.test.ts | updateQuantity con 0 elimina el producto |
| CP-MOB-011-03 | Cantidad negativa elimina producto | Unit Test / Jest | useCart.test.ts | updateQuantity con negativa elimina |
| CP-MOB-011-04 | Actualizar recalcula totales | Unit Test / Jest | useCart.test.ts | updateQuantity recalcula totales |
| CP-MOB-011-05 | Actualizar producto inexistente | Unit Test / Jest | useCart.test.ts | no modifica el carrito |

#### CU-012: Eliminar Producto del Carrito (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-012-01 | Eliminar producto exitoso | Unit Test / Jest | useCart.test.ts | removeItem elimina un producto |
| CP-MOB-012-02 | Eliminar recalcula totales | Unit Test / Jest | useCart.test.ts | removeItem recalcula count y totales |
| CP-MOB-012-03 | Eliminar producto inexistente | Unit Test / Jest | useCart.test.ts | no modifica el carrito |

#### CU-013: Vaciar Carrito (1 prueba — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-013-01 | Vaciar carrito exitoso | Unit Test / Jest | useCart.test.ts | clear vacía el carrito |

#### CU-014: Crear Pedido (7 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-014-01 | Crear pedido exitoso | Unit Test / Jest | order.service.test.ts | sincroniza carrito y crea pedido |
| CP-MOB-014-02 | Crear pedido con observaciones | Unit Test / Jest | order.service.test.ts | incluye observaciones en el payload |
| CP-MOB-014-03 | Crear pedido error backend | Unit Test / Jest | order.service.test.ts | lanza error cuando el backend falla |
| CP-MOB-014-04 | Crear pedido carrito vacío | Unit Test / Jest | order.service.test.ts | lanza error cuando el carrito está vacío |
| CP-MOB-014-05 | Sincronizar carrito exitoso | Unit Test / Jest | cart.service.test.ts | envía cada item al backend |
| CP-MOB-014-06 | Sincronizar carrito error item | Unit Test / Jest | cart.service.test.ts | lanza error si algún item falla |
| CP-MOB-014-07 | Sincronizar carrito array vacío | Unit Test / Jest | cart.service.test.ts | no envía nada si el array está vacío |

#### CU-015: Ver Historial de Pedidos (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-015-01 | Listar mis pedidos exitoso | Unit Test / Jest | order.service.test.ts | retorna array de Order mapeados |
| CP-MOB-015-02 | Listar mis pedidos vacío | Unit Test / Jest | order.service.test.ts | retorna array vacío |
| CP-MOB-015-03 | Listar mis pedidos error servidor | Unit Test / Jest | order.service.test.ts | lanza error cuando el servidor falla |

#### CU-016: Cancelar Pedido (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-016-01 | Cancelar pedido exitoso | Unit Test / Jest | order.service.test.ts | llama PATCH /pedidos/:id/cancel |
| CP-MOB-016-02 | Cancelar pedido conflicto | Unit Test / Jest | order.service.test.ts | lanza error cuando no se puede cancelar |
| CP-MOB-016-03 | Cancelar pedido no existe | Unit Test / Jest | order.service.test.ts | lanza error cuando el pedido no existe |

#### CU-017: Ver Pedidos Pendientes — Admin (4 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-017-01 | Listar admin pedidos exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de AdminOrder mapeados |
| CP-MOB-017-02 | Listar admin pedidos con wrapper | Unit Test / Jest | admin.service.test.ts | maneja wrapper { data: [...] } |
| CP-MOB-017-03 | Hook useAdminOrders carga datos | Unit Test / Jest | useAdminInventory.test.ts | carga pedidos y repartidores |
| CP-MOB-017-04 | Hook useAdminOrders maneja error | Unit Test / Jest | useAdminInventory.test.ts | maneja error al cargar pedidos |

#### CU-019: Asignar Pedido a Repartidor (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-019-01 | AssignOrder exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT con id_repartidor |
| CP-MOB-019-02 | Hook useAdminOrders assignOrder | Unit Test / Jest | useAdminInventory.test.ts | assignOrder actualiza el pedido |

#### CU-020: Dashboard del Repartidor (6 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-020-01 | Obtener dashboard exitoso | Unit Test / Jest | delivery.service.test.ts | retorna DriverDashboard mapeado |
| CP-MOB-020-02 | Obtener dashboard con wrapper | Unit Test / Jest | delivery.service.test.ts | maneja wrapper { data: {...} } |
| CP-MOB-020-03 | Obtener dashboard error servidor | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el servidor falla |
| CP-MOB-020-04 | Hook useDriverOrders carga dashboard | Unit Test / Jest | useDriverOrders.test.ts | carga dashboard al montar |
| CP-MOB-020-05 | Hook useDriverOrders maneja error | Unit Test / Jest | useDriverOrders.test.ts | maneja error al cargar dashboard |
| CP-MOB-020-06 | Hook useDriverOrders recarga | Unit Test / Jest | useDriverOrders.test.ts | reload recarga el dashboard |

#### CU-021: Ver Detalle de Pedido — Repartidor (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-021-01 | Obtener detalle pedido exitoso | Unit Test / Jest | delivery.service.test.ts | retorna DeliveryOrder mapeado |
| CP-MOB-021-02 | Obtener detalle pedido no existe | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el pedido no existe |
| CP-MOB-021-03 | Hook useDriverOrders carga detalle | Unit Test / Jest | useDriverOrders.test.ts | carga detalle del pedido activo |

#### CU-022: Iniciar Entrega (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-022-01 | UpdateDeliveryStatus exitoso | Unit Test / Jest | delivery.service.test.ts | llama PATCH con el estado y observación |
| CP-MOB-022-02 | Hook useDriverOrders startDelivery | Unit Test / Jest | useDriverOrders.test.ts | startDelivery llama updateDeliveryStatus |

#### CU-023: Registrar Entrega Exitosa (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-023-01 | EntregarPedido exitoso | Unit Test / Jest | delivery.service.test.ts | llama updateDeliveryStatus con ENTREGADO |
| CP-MOB-023-02 | Hook useDriverOrders deliverOrder | Unit Test / Jest | useDriverOrders.test.ts | deliverOrder llama entregarPedido |

#### CU-024: Marcar No Entregado (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-024-01 | MarcarNoEntregado exitoso | Unit Test / Jest | delivery.service.test.ts | llama updateDeliveryStatus con NO_ENTREGADO |
| CP-MOB-024-02 | Hook useDriverOrders markNotDelivered | Unit Test / Jest | useDriverOrders.test.ts | markNotDelivered llama marcarNoEntregado |

#### CU-025: Subir Comprobante de Entrega (2 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-025-01 | Subir comprobante exitoso | Unit Test / Jest | delivery.service.test.ts | sube imagen y retorna la URL |
| CP-MOB-025-02 | Subir comprobante error servidor | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el servidor falla |

#### CU-026: Gestionar Usuarios — Admin (9 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-026-01 | Listar usuarios exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de UsuarioAdmin mapeados |
| CP-MOB-026-02 | Crear usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna UsuarioAdmin |
| CP-MOB-026-03 | Actualizar usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna UsuarioAdmin |
| CP-MOB-026-04 | Eliminar usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE |
| CP-MOB-026-05 | Hook useAdminUsers carga datos | Unit Test / Jest | useAdminUsers.test.ts | carga usuarios y roles |
| CP-MOB-026-06 | Hook useAdminUsers maneja error | Unit Test / Jest | useAdminUsers.test.ts | maneja error al cargar |
| CP-MOB-026-07 | Hook useAdminUsers crea usuario | Unit Test / Jest | useAdminUsers.test.ts | create agrega usuario |
| CP-MOB-026-08 | Hook useAdminUsers actualiza | Unit Test / Jest | useAdminUsers.test.ts | update actualiza usuario |
| CP-MOB-026-09 | Hook useAdminUsers elimina | Unit Test / Jest | useAdminUsers.test.ts | remove elimina usuario |

#### CU-027: Gestionar Categorías — Admin (9 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-027-01 | Listar categorías exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de CategoriaAdmin |
| CP-MOB-027-02 | Crear categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna CategoriaAdmin |
| CP-MOB-027-03 | Actualizar categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna CategoriaAdmin |
| CP-MOB-027-04 | Eliminar categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE |
| CP-MOB-027-05 | Hook useAdminCategories carga | Unit Test / Jest | useAdminCategories.test.ts | carga categorías |
| CP-MOB-027-06 | Hook useAdminCategories error | Unit Test / Jest | useAdminCategories.test.ts | maneja error |
| CP-MOB-027-07 | Hook useAdminCategories crea | Unit Test / Jest | useAdminCategories.test.ts | create agrega categoría |
| CP-MOB-027-08 | Hook useAdminCategories actualiza | Unit Test / Jest | useAdminCategories.test.ts | update actualiza |
| CP-MOB-027-09 | Hook useAdminCategories elimina | Unit Test / Jest | useAdminCategories.test.ts | remove elimina |

#### CU-028: Gestionar Proveedores — Admin (9 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-028-01 | Listar proveedores exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de ProveedorAdmin |
| CP-MOB-028-02 | Crear proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna ProveedorAdmin |
| CP-MOB-028-03 | Actualizar proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna ProveedorAdmin |
| CP-MOB-028-04 | Eliminar proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE |
| CP-MOB-028-05 | Hook useAdminSuppliers carga | Unit Test / Jest | useAdminSuppliers.test.ts | carga proveedores |
| CP-MOB-028-06 | Hook useAdminSuppliers error | Unit Test / Jest | useAdminSuppliers.test.ts | maneja error |
| CP-MOB-028-07 | Hook useAdminSuppliers crea | Unit Test / Jest | useAdminSuppliers.test.ts | create agrega proveedor |
| CP-MOB-028-08 | Hook useAdminSuppliers actualiza | Unit Test / Jest | useAdminSuppliers.test.ts | update actualiza |
| CP-MOB-028-09 | Hook useAdminSuppliers elimina | Unit Test / Jest | useAdminSuppliers.test.ts | remove elimina |

#### CU-029: Gestionar Repartidores — Admin (9 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-029-01 | Listar repartidores exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de RepartidorAdmin |
| CP-MOB-029-02 | Crear repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama POST /admin/repartidores |
| CP-MOB-029-03 | Actualizar repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT /admin/repartidores/:id |
| CP-MOB-029-04 | Eliminar repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE |
| CP-MOB-029-05 | Hook useAdminDrivers carga | Unit Test / Jest | useAdminDrivers.test.ts | carga repartidores |
| CP-MOB-029-06 | Hook useAdminDrivers error | Unit Test / Jest | useAdminDrivers.test.ts | maneja error |
| CP-MOB-029-07 | Hook useAdminDrivers crea | Unit Test / Jest | useAdminDrivers.test.ts | create llama createDriver |
| CP-MOB-029-08 | Hook useAdminDrivers actualiza | Unit Test / Jest | useAdminDrivers.test.ts | update llama updateDriver |
| CP-MOB-029-09 | Hook useAdminDrivers elimina | Unit Test / Jest | useAdminDrivers.test.ts | remove elimina repartidor |

#### CU-030: Gestionar Roles — Admin (7 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-030-01 | Listar roles exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de RolAdmin |
| CP-MOB-030-02 | Crear rol exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna RolAdmin |
| CP-MOB-030-03 | Actualizar rol exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna RolAdmin |
| CP-MOB-030-04 | Hook useAdminRoles carga | Unit Test / Jest | useAdminRoles.test.ts | carga roles |
| CP-MOB-030-05 | Hook useAdminRoles error | Unit Test / Jest | useAdminRoles.test.ts | maneja error |
| CP-MOB-030-06 | Hook useAdminRoles crea | Unit Test / Jest | useAdminRoles.test.ts | create agrega rol |
| CP-MOB-030-07 | Hook useAdminRoles actualiza | Unit Test / Jest | useAdminRoles.test.ts | update actualiza rol |

#### CU-031: Subir Imagen de Producto — Admin (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-031-01 | Subir imagen producto exitoso | Unit Test / Jest | admin.service.test.ts | sube imagen y retorna la URL |
| CP-MOB-031-02 | Subir imagen producto error | Unit Test / Jest | admin.service.test.ts | lanza error cuando el servidor falla |
| CP-MOB-031-03 | Entregar con evidencia exitoso | Unit Test / Jest | admin.service.test.ts | sube evidencia y marca pedido como entregado |

#### CU-032: Asignar/Confirmar/Entregar Pedido — Admin (3 pruebas — móvil)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-032-01 | Hook useAdminOrders assignOrder | Unit Test / Jest | useAdminInventory.test.ts | assignOrder actualiza el pedido |
| CP-MOB-032-02 | Hook useAdminOrders confirmOrder | Unit Test / Jest | useAdminInventory.test.ts | confirmOrder actualiza el estado |
| CP-MOB-032-03 | Hook useAdminOrders deliverOrder | Unit Test / Jest | useAdminInventory.test.ts | deliverOrder llama deliverOrderWithEvidence |

### 3.3 Pruebas de Integración — Móvil (36 pruebas)

Las pruebas de integración validan flujos completos entre múltiples servicios, simulando interacciones reales del usuario con mocks de respuestas del backend.

#### Flujo Autenticación (5 pruebas)

| # | Prueba | Tipo | Archivo | Descripción |
|---|--------|------|---------|-------------|
| INT-AUTH-01 | Flujo completo register→login→perfil→actualizar→logout | Integration Test | auth-flow.integration.test.ts | Valida el flujo completo de autenticación |
| INT-AUTH-02 | Login falla con credenciales incorrectas | Integration Test | auth-flow.integration.test.ts | Verifica rechazo de credenciales inválidas |
| INT-AUTH-03 | ForgotPassword + resetPassword fluye correctamente | Integration Test | auth-flow.integration.test.ts | Valida recuperación de contraseña |
| INT-AUTH-04 | ForgotPassword falla con email no registrado | Integration Test | auth-flow.integration.test.ts | Verifica manejo de email inexistente |
| INT-AUTH-05 | Logout siempre limpia el token aunque falle | Integration Test | auth-flow.integration.test.ts | Verifica limpieza de token en error |

#### Flujo Carrito→Orden (5 pruebas)

| # | Prueba | Tipo | Archivo | Descripción |
|---|--------|------|---------|-------------|
| INT-CART-01 | Agregar producto al carrito + calcular totales | Integration Test | cart-order-flow.integration.test.ts | Verifica addItem y cálculo con delivery fee |
| INT-CART-02 | Crear orden con items → obtener pedido en lista | Integration Test | cart-order-flow.integration.test.ts | Valida flujo crear→listar pedidos |
| INT-CART-03 | Sincronizar carrito llama API por cada item | Integration Test | cart-order-flow.integration.test.ts | Verifica llamadas POST /carrito por item |
| INT-CART-04 | Crear orden con items vacíos crea el pedido | Integration Test | cart-order-flow.integration.test.ts | Valida behavior con carrito vacío |
| INT-CART-05 | Listar pedidos vacío retorna array | Integration Test | cart-order-flow.integration.test.ts | Verifica respuesta vacía |

#### Flujo Catálogo (8 pruebas)

| # | Prueba | Tipo | Archivo | Descripción |
|---|--------|------|---------|-------------|
| INT-CAT-01 | Listar productos retorna productos mapeados | Integration Test | catalog-flow.integration.test.ts | Verifica mapeo BackendProducto→Product |
| INT-CAT-02 | Obtener producto por ID individual | Integration Test | catalog-flow.integration.test.ts | Valida getProduct por ID |
| INT-CAT-03 | Listar categorías activas mapeadas | Integration Test | catalog-flow.integration.test.ts | Verifica filtro estado=1 y mapeo |
| INT-CAT-04 | Flujo listar→obtener detalle del primero | Integration Test | catalog-flow.integration.test.ts | Valida flujo completo catálogo |
| INT-CAT-05 | Flujo listar categorías→filtrar productos | Integration Test | catalog-flow.integration.test.ts | Verifica filtrado por categoría |
| INT-CAT-06 | Obtener producto inexistente lanza error | Integration Test | catalog-flow.integration.test.ts | Manejo de error 404 |
| INT-CAT-07 | Catálogo con respuesta vacía retorna [] | Integration Test | catalog-flow.integration.test.ts | Valida respuesta vacía |
| INT-CAT-08 | Catálogo con wrapper items funciona | Integration Test | catalog-flow.integration.test.ts | Verifica extracción de wrapper |

#### Flujo Repartidor (6 pruebas)

| # | Prueba | Tipo | Archivo | Descripción |
|---|--------|------|---------|-------------|
| INT-DRV-01 | Dashboard retorna conteo, activo y cola | Integration Test | driver-flow.integration.test.ts | Verifica mapeo DriverDashboard |
| INT-DRV-02 | Detalle retorna con productos | Integration Test | driver-flow.integration.test.ts | Valida DeliveryOrder con OrderProduct |
| INT-DRV-03 | EntregarPedido cambia estado a ENTREGADO | Integration Test | driver-flow.integration.test.ts | Verifica PATCH /estado |
| INT-DRV-04 | MarcarNoEntregado con observación | Integration Test | driver-flow.integration.test.ts | Valida NO_ENTREGADO con motivo |
| INT-DRV-05 | Flujo completo dashboard→detalle→entregar | Integration Test | driver-flow.integration.test.ts | Flujo end-to-end repartidor |
| INT-DRV-06 | Dashboard sin pedido activo retorna null | Integration Test | driver-flow.integration.test.ts | Valida estado vacío |

#### Flujo Admin Panel (12 pruebas)

| # | Prueba | Tipo | Archivo | Descripción |
|---|--------|------|---------|-------------|
| INT-ADM-01 | Listar usuarios mapeados | Integration Test | admin-flow.integration.test.ts | Verifica mapeo BackendUsuarioAdmin→UsuarioAdmin |
| INT-ADM-02 | CRUD usuarios completo | Integration Test | admin-flow.integration.test.ts | create→update→delete usuario |
| INT-ADM-03 | Listar categorías mapeadas | Integration Test | admin-flow.integration.test.ts | Verifica mapeo BackendCategoria→CategoriaAdmin |
| INT-ADM-04 | CRUD categorías completo | Integration Test | admin-flow.integration.test.ts | create→update→delete categoría |
| INT-ADM-05 | Listar proveedores mapeados | Integration Test | admin-flow.integration.test.ts | Verifica mapeo Proveedor |
| INT-ADM-06 | CRUD proveedores completo | Integration Test | admin-flow.integration.test.ts | create→update→delete proveedor |
| INT-ADM-07 | Listar repartidores mapeados | Integration Test | admin-flow.integration.test.ts | Verifica mapeo RepartidorAdmin |
| INT-ADM-08 | CRUD repartidores completo | Integration Test | admin-flow.integration.test.ts | create→update→delete repartidor |
| INT-ADM-09 | Listar roles mapeados | Integration Test | admin-flow.integration.test.ts | Verifica mapeo BackendRol→RolAdmin |
| INT-ADM-10 | CRUD roles completo | Integration Test | admin-flow.integration.test.ts | create→update rol |
| INT-ADM-11 | Obtener analytics retorna datos | Integration Test | admin-flow.integration.test.ts | Verifica AnalyticsResumen |
| INT-ADM-12 | Flujo admin completo: usuarios→categorías→analytics | Integration Test | admin-flow.integration.test.ts | Flujo end-to-end admin |

---

## 4. Resumen Consolidado

| Métrica | Backend | Móvil | Total |
|---------|---------|-------|-------|
| Suites de prueba | 27 | 22 | 49 |
| Total pruebas | 203 | 193 | 396 |
| CUs cubiertos | 20 | 18 | — |
| Tipo de prueba | Integración (UseCase + InMemory Repository) | Unitaria + Integración (Servicio/Hook + Mock) | — |
| Estado | ✓ Todas pasan | ✓ Todas pasan | ✓ |

---

## 5. Criterios de Aceptación

| Criterio | Estado |
|----------|--------|
| Todas las pruebas pasan al ejecutar `npm test` (backend) | ✓ |
| Todas las pruebas pasan al ejecutar `npm test` (móvil) | ✓ |
| Cada CP corresponde a una prueba real en el código | ✓ |
| No hay CPs ficticios sin implementación | ✓ |
| Cada prueba está en un archivo TypeScript (móvil) o JavaScript (backend) | ✓ |
| Se usa framework Jest en ambas capas | ✓ |
| Se mapea CU → CP → prueba específica | ✓ |
| Se documenta el tipo de prueba correctamente | ✓ |

---

## 6. Notas

1. **Backend — Pruebas de Integración**: Cada prueba instancia un repositorio InMemory, inyecta casos de uso通过 constructor, y verifica el resultado completo del flujo de negocio. No dependen de base de datos externa ni de red.

2. **Móvil — Pruebas Unitarias**: Cada prueba mockea la capa de red (`jest.mock`) y verifica que los servicios mapean correctamente las respuestas y que los hooks gestionan el estado de React. No dependen del backend corriendo.

3. **Móvil — Pruebas de Integración**: Verifican flujos completos entre servicios (auth → login → perfil, catálogo → categorías → productos, dashboard → detalle → entrega, CRUD admin completo). Utilizan mocks de respuestas del API con datos que siguen los mapeos reales de backend a frontend.

3. **CU-018 (Historial de Pedidos del Repartidor)**: Tiene pruebas de integración en el backend (`verHistorialPedidos.test.js`, 4 pruebas) pero no tiene pruebas unitarias en el móvil porque no existe endpoint correspondiente en la capa de servicios del cliente.

4. **Cobertura de UI**: Ninguna de las dos capas incluye pruebas de componentes de UI (screens, modales, navegación). La cobertura se limita a lógica de negocio y servicios.

5. **Delivery fee fijo**: Las pruebas del móvil asumen $5.000 fijo para todos los tests de carrito.
