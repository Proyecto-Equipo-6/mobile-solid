# Informe de Pruebas — Módulo Móvil NexBit

| Campo | Valor |
|-------|-------|
| Proyecto | NexBit Móvil (Expo SDK 57, React Native 0.86.2, TypeScript 6.0.3) |
| Fecha | 2026-08-30 |
| Total suites | 22 |
| Total pruebas | 193 |
| Estado | Todas pasan ✓ |
| Tipos de prueba | Unit Test / Jest + Integration Test / Jest |
| Framework | Jest 29.7.0 + jest-expo 57.0.4 + @testing-library/react-native 14.x |

---

## 1. Cobertura por Caso de Uso

| CU | Descripción | CPs | Pruebas | Estado |
|----|-------------|-----|---------|--------|
| CU-001 | Login | 3 | 3 | ✓ |
| CU-002 | Registro | 3 | 3 | ✓ |
| CU-003 | Recuperar contraseña | 5 | 5 | ✓ |
| CU-004 | Ver perfil | 2 | 2 | ✓ |
| CU-005 | Editar perfil | 2 | 2 | ✓ |
| CU-006 | Cerrar sesión | 2 | 2 | ✓ |
| CU-007 | Ver catálogo | 12 | 12 | ✓ |
| CU-008 | Ver detalle producto | 1 | 1 | ✓ |
| CU-009 | Agregar al carrito | 6 | 6 | ✓ |
| CU-010 | Ver carrito | 3 | 3 | ✓ |
| CU-011 | Actualizar cantidad | 5 | 5 | ✓ |
| CU-012 | Eliminar producto del carrito | 3 | 3 | ✓ |
| CU-013 | Vaciar carrito | 1 | 1 | ✓ |
| CU-014 | Crear pedido | 7 | 7 | ✓ |
| CU-015 | Ver historial de pedidos | 3 | 3 | ✓ |
| CU-016 | Cancelar pedido | 3 | 3 | ✓ |
| CU-017 | Ver pedidos pendientes (admin) | 4 | 4 | ✓ |
| CU-019 | Asignar pedido a repartidor | 2 | 2 | ✓ |
| CU-020 | Dashboard del repartidor | 6 | 6 | ✓ |
| CU-021 | Ver detalle de pedido (repartidor) | 3 | 3 | ✓ |
| CU-022 | Iniciar entrega | 2 | 2 | ✓ |
| CU-023 | Registrar entrega exitosa | 2 | 2 | ✓ |
| CU-024 | Marcar no entregado | 2 | 2 | ✓ |
| CU-025 | Subir comprobante de entrega | 2 | 2 | ✓ |
| CU-026 | Gestionar usuarios (admin) | 9 | 9 | ✓ |
| CU-027 | Gestionar categorías (admin) | 9 | 9 | ✓ |
| CU-028 | Gestionar proveedores (admin) | 9 | 9 | ✓ |
| CU-029 | Gestionar repartidores (admin) | 9 | 9 | ✓ |
| CU-030 | Gestionar roles (admin) | 7 | 7 | ✓ |
| CU-031 | Subir imagen de producto (admin) | 3 | 3 | ✓ |
| CU-032 | Asignar/confirmar/entregar pedido (admin) | 3 | 3 | ✓ |
| **TOTAL (Unit Tests)** | | **127** | **127** | |

> Los 36 tests de integración adicionales se documentan en la sección 3.3.

> **Nota**: CU-018 (Historial de pedidos del repartidor) no tiene endpoint en el backend móvil. No se incluye CPs ficticios.

---

## 2. Detalle por Caso de Uso

### CU-001: Login

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-001-01 | Login exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/login y retorna User mapeado |
| CP-MOB-001-02 | Login con credenciales inválidas | Unit Test / Jest | auth.service.test.ts | lanza error cuando las credenciales son inválidas |
| CP-MOB-001-03 | Login guarda token en memoria | Unit Test / Jest | auth.service.test.ts | guarda el token en memoria después del login |

### CU-002: Registro

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-002-01 | Registro exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /users y retorna User mapeado |
| CP-MOB-002-02 | Registro exitoso autentica automáticamente | Unit Test / Jest | useAuth.test.ts | register exitoso llama login automáticamente |
| CP-MOB-002-03 | Registro con error no autentica | Unit Test / Jest | useAuth.test.ts | register con error no autentica al usuario |

### CU-003: Recuperar contraseña

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-003-01 | Solicitar reset exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/forgot-password con el email |
| CP-MOB-003-02 | Solicitar reset email no existe | Unit Test / Jest | auth.service.test.ts | lanza error cuando el email no existe |
| CP-MOB-003-03 | Reset password exitoso | Unit Test / Jest | auth.service.test.ts | llama POST /auth/reset-password con token y nueva contraseña |
| CP-MOB-003-04 | Reset password token inválido | Unit Test / Jest | auth.service.test.ts | lanza error cuando el token es inválido |
| CP-MOB-003-05 | Reset password token expirado | Unit Test / Jest | auth.service.test.ts | lanza error cuando el token ha expirado |

### CU-004: Ver perfil

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-004-01 | Obtener perfil exitoso | Unit Test / Jest | profile.service.test.ts | llama GET /users/perfil y retorna User mapeado |
| CP-MOB-004-02 | Obtener perfil error del servidor | Unit Test / Jest | profile.service.test.ts | lanza error cuando el servidor falla |

### CU-005: Editar perfil

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-005-01 | Actualizar perfil exitoso | Unit Test / Jest | profile.service.test.ts | llama PUT /users/perfil con los datos actualizados |
| CP-MOB-005-02 | Actualizar perfil datos inválidos | Unit Test / Jest | profile.service.test.ts | lanza error cuando los datos son inválidos |

### CU-006: Cerrar sesión

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-006-01 | Logout exitoso limpia token | Unit Test / Jest | auth.service.test.ts | llama POST /auth/logout y limpia el token |
| CP-MOB-006-02 | Logout limpia token aunque falle | Unit Test / Jest | auth.service.test.ts | limpia el token aunque el request falle |

### CU-007: Ver catálogo

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-007-01 | Listar productos exitoso | Unit Test / Jest | catalog.service.test.ts | retorna array de Product mapeados desde /productos/publico |
| CP-MOB-007-02 | Listar productos vacío | Unit Test / Jest | catalog.service.test.ts | retorna array vacío cuando la respuesta es un array vacío |
| CP-MOB-007-03 | Listar productos con wrapper items | Unit Test / Jest | catalog.service.test.ts | maneja respuesta con wrapper { items: [...] } |
| CP-MOB-007-04 | Listar productos con wrapper productos | Unit Test / Jest | catalog.service.test.ts | maneja respuesta con wrapper { productos: [...] } |
| CP-MOB-007-05 | Listar productos error servidor | Unit Test / Jest | catalog.service.test.ts | lanza error cuando el servidor falla |
| CP-MOB-007-06 | Listar categorías activas | Unit Test / Jest | catalog.service.test.ts | retorna categorías activas (estado=1) mapeadas |
| CP-MOB-007-07 | Filtrar categorías inactivas | Unit Test / Jest | catalog.service.test.ts | filtra categorías inactivas (estado=0) |
| CP-MOB-007-08 | Listar categorías con wrapper | Unit Test / Jest | catalog.service.test.ts | maneja respuesta con wrapper { categorias: [...] } |
| CP-MOB-007-09 | Hook useProducts carga datos | Unit Test / Jest | useProducts.test.ts | carga productos y categorías al montar |
| CP-MOB-007-10 | Hook useProducts maneja error | Unit Test / Jest | useProducts.test.ts | maneja error al cargar catálogo |
| CP-MOB-007-11 | Hook useProducts filtra por categoría | Unit Test / Jest | useProducts.test.ts | filtra productos por categoría seleccionada |
| CP-MOB-007-12 | Hook useProducts recarga datos | Unit Test / Jest | useProducts.test.ts | reload recarga los datos |

### CU-008: Ver detalle producto

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-008-01 | Obtener producto por ID | Unit Test / Jest | catalog.service.test.ts | retorna un Product mapeado por ID |

### CU-009: Agregar al carrito

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-009-01 | Agregar producto nuevo | Unit Test / Jest | useCart.test.ts | addItem agrega un producto al carrito |
| CP-MOB-009-02 | Agregar producto duplicado incrementa cantidad | Unit Test / Jest | useCart.test.ts | addItem incrementa cantidad si el producto ya existe |
| CP-MOB-009-03 | Agregar recalcula totales | Unit Test / Jest | useCart.test.ts | addItem recalcula count y totales |
| CP-MOB-009-04 | Servicio agregarAlCarrito exitoso | Unit Test / Jest | cart.service.test.ts | llama POST /carrito con productoId y cantidad por defecto |
| CP-MOB-009-05 | Servicio agregarAlCarrito cantidad personalizada | Unit Test / Jest | cart.service.test.ts | llama POST /carrito con cantidad personalizada |
| CP-MOB-009-06 | Servicio agregarAlCarrito producto no existe | Unit Test / Jest | cart.service.test.ts | lanza error cuando el producto no existe |

### CU-010: Ver carrito

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-010-01 | Carrito inicia vacío | Unit Test / Jest | useCart.test.ts | inicia con carrito vacío |
| CP-MOB-010-02 | Servicio verCarrito exitoso | Unit Test / Jest | cart.service.test.ts | llama GET /carrito |
| CP-MOB-010-03 | Carrito calcula totales con delivery fee | Unit Test / Jest | useCart.test.ts | calcula totales correctamente con delivery fee |

### CU-011: Actualizar cantidad

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-011-01 | Actualizar cantidad exitoso | Unit Test / Jest | useCart.test.ts | updateQuantity actualiza la cantidad |
| CP-MOB-011-02 | Cantidad 0 elimina producto | Unit Test / Jest | useCart.test.ts | updateQuantity con 0 elimina el producto |
| CP-MOB-011-03 | Cantidad negativa elimina producto | Unit Test / Jest | useCart.test.ts | updateQuantity con cantidad negativa elimina el producto (quantity <= 0) |
| CP-MOB-011-04 | Actualizar recalcula totales | Unit Test / Jest | useCart.test.ts | updateQuantity recalcula totales correctamente |
| CP-MOB-011-05 | Actualizar producto inexistente no modifica | Unit Test / Jest | useCart.test.ts | updateQuantity con producto inexistente no modifica el carrito |

### CU-012: Eliminar producto del carrito

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-012-01 | Eliminar producto exitoso | Unit Test / Jest | useCart.test.ts | removeItem elimina un producto del carrito |
| CP-MOB-012-02 | Eliminar recalcula totales | Unit Test / Jest | useCart.test.ts | removeItem recalcula count y totales |
| CP-MOB-012-03 | Eliminar producto inexistente no modifica | Unit Test / Jest | useCart.test.ts | removeItem con producto inexistente no modifica el carrito |

### CU-013: Vaciar carrito

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-013-01 | Vaciar carrito exitoso | Unit Test / Jest | useCart.test.ts | clear vacía el carrito |

### CU-014: Crear pedido

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-014-01 | Crear pedido exitoso | Unit Test / Jest | order.service.test.ts | sincroniza carrito y crea pedido, retorna Order mapeado |
| CP-MOB-014-02 | Crear pedido con observaciones | Unit Test / Jest | order.service.test.ts | incluye observaciones en el payload |
| CP-MOB-014-03 | Crear pedido error backend | Unit Test / Jest | order.service.test.ts | lanza error cuando el backend falla |
| CP-MOB-014-04 | Crear pedido carrito vacío | Unit Test / Jest | order.service.test.ts | lanza error cuando el carrito está vacío |
| CP-MOB-014-05 | Sincronizar carrito exitoso | Unit Test / Jest | cart.service.test.ts | envía cada item del carrito al backend |
| CP-MOB-014-06 | Sincronizar carrito error item | Unit Test / Jest | cart.service.test.ts | lanza error si algún item falla |
| CP-MOB-014-07 | Sincronizar carrito array vacío | Unit Test / Jest | cart.service.test.ts | no envía nada si el array está vacío |

### CU-015: Ver historial de pedidos

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-015-01 | Listar mis pedidos exitoso | Unit Test / Jest | order.service.test.ts | retorna array de Order mapeados desde /pedidos |
| CP-MOB-015-02 | Listar mis pedidos vacío | Unit Test / Jest | order.service.test.ts | retorna array vacío cuando no hay pedidos |
| CP-MOB-015-03 | Listar mis pedidos error servidor | Unit Test / Jest | order.service.test.ts | lanza error cuando el servidor falla |

### CU-016: Cancelar pedido

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-016-01 | Cancelar pedido exitoso | Unit Test / Jest | order.service.test.ts | llama PATCH /pedidos/:id/cancel y retorna Order mapeado |
| CP-MOB-016-02 | Cancelar pedido conflicto | Unit Test / Jest | order.service.test.ts | lanza error cuando el pedido no se puede cancelar |
| CP-MOB-016-03 | Cancelar pedido no existe | Unit Test / Jest | order.service.test.ts | lanza error cuando el pedido no existe |

### CU-017: Ver pedidos pendientes (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-017-01 | Listar admin pedidos exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de AdminOrder mapeados |
| CP-MOB-017-02 | Listar admin pedidos con wrapper | Unit Test / Jest | admin.service.test.ts | maneja respuesta con wrapper { data: [...] } |
| CP-MOB-017-03 | Hook useAdminOrders carga datos | Unit Test / Jest | useAdminInventory.test.ts | carga pedidos y repartidores al montar |
| CP-MOB-017-04 | Hook useAdminOrders maneja error | Unit Test / Jest | useAdminInventory.test.ts | maneja error al cargar pedidos |

### CU-019: Asignar pedido a repartidor

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-019-01 | AssignOrder exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT con id_repartidor |
| CP-MOB-019-02 | Hook useAdminOrders assignOrder | Unit Test / Jest | useAdminInventory.test.ts | assignOrder actualiza el pedido en la lista |

### CU-020: Dashboard del repartidor

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-020-01 | Obtener dashboard exitoso | Unit Test / Jest | delivery.service.test.ts | retorna DriverDashboard mapeado desde /repartidor/dashboard |
| CP-MOB-020-02 | Obtener dashboard con wrapper | Unit Test / Jest | delivery.service.test.ts | maneja respuesta con wrapper { data: {...} } |
| CP-MOB-020-03 | Obtener dashboard error servidor | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el servidor falla |
| CP-MOB-020-04 | Hook useDriverOrders carga dashboard | Unit Test / Jest | useDriverOrders.test.ts | carga dashboard al montar |
| CP-MOB-020-05 | Hook useDriverOrders maneja error | Unit Test / Jest | useDriverOrders.test.ts | maneja error al cargar dashboard |
| CP-MOB-020-06 | Hook useDriverOrders recarga | Unit Test / Jest | useDriverOrders.test.ts | reload recarga el dashboard |

### CU-021: Ver detalle de pedido (repartidor)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-021-01 | Obtener detalle pedido exitoso | Unit Test / Jest | delivery.service.test.ts | retorna DeliveryOrder mapeado por ID |
| CP-MOB-021-02 | Obtener detalle pedido no existe | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el pedido no existe |
| CP-MOB-021-03 | Hook useDriverOrders carga detalle | Unit Test / Jest | useDriverOrders.test.ts | carga detalle del pedido activo si existe |

### CU-022: Iniciar entrega

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-022-01 | UpdateDeliveryStatus exitoso | Unit Test / Jest | delivery.service.test.ts | llama PATCH con el estado y observación |
| CP-MOB-022-02 | Hook useDriverOrders startDelivery | Unit Test / Jest | useDriverOrders.test.ts | startDelivery llama updateDeliveryStatus y recarga |

### CU-023: Registrar entrega exitosa

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-023-01 | EntregarPedido exitoso | Unit Test / Jest | delivery.service.test.ts | llama updateDeliveryStatus con ENTREGADO y comprobante |
| CP-MOB-023-02 | Hook useDriverOrders deliverOrder | Unit Test / Jest | useDriverOrders.test.ts | deliverOrder llama entregarPedido |

### CU-024: Marcar no entregado

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-024-01 | MarcarNoEntregado exitoso | Unit Test / Jest | delivery.service.test.ts | llama updateDeliveryStatus con NO_ENTREGADO y observación |
| CP-MOB-024-02 | Hook useDriverOrders markNotDelivered | Unit Test / Jest | useDriverOrders.test.ts | markNotDelivered llama marcarNoEntregado |

### CU-025: Subir comprobante de entrega

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-025-01 | Subir comprobante exitoso | Unit Test / Jest | delivery.service.test.ts | sube imagen y retorna la URL del comprobante |
| CP-MOB-025-02 | Subir comprobante error servidor | Unit Test / Jest | delivery.service.test.ts | lanza error cuando el servidor falla al subir |

### CU-026: Gestionar usuarios (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-026-01 | Listar usuarios exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de UsuarioAdmin mapeados |
| CP-MOB-026-02 | Crear usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna UsuarioAdmin mapeado |
| CP-MOB-026-03 | Actualizar usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna UsuarioAdmin actualizado |
| CP-MOB-026-04 | Eliminar usuario exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE /admin/usuarios/:id |
| CP-MOB-026-05 | Hook useAdminUsers carga datos | Unit Test / Jest | useAdminUsers.test.ts | carga usuarios y roles al montar |
| CP-MOB-026-06 | Hook useAdminUsers maneja error | Unit Test / Jest | useAdminUsers.test.ts | maneja error al cargar usuarios |
| CP-MOB-026-07 | Hook useAdminUsers crea usuario | Unit Test / Jest | useAdminUsers.test.ts | create agrega un usuario a la lista |
| CP-MOB-026-08 | Hook useAdminUsers actualiza usuario | Unit Test / Jest | useAdminUsers.test.ts | update actualiza un usuario en la lista |
| CP-MOB-026-09 | Hook useAdminUsers elimina usuario | Unit Test / Jest | useAdminUsers.test.ts | remove elimina un usuario de la lista |

### CU-027: Gestionar categorías (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-027-01 | Listar categorías exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de CategoriaAdmin mapeados |
| CP-MOB-027-02 | Crear categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna CategoriaAdmin |
| CP-MOB-027-03 | Actualizar categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna CategoriaAdmin actualizada |
| CP-MOB-027-04 | Eliminar categoría exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE /categorias/:id |
| CP-MOB-027-05 | Hook useAdminCategories carga datos | Unit Test / Jest | useAdminCategories.test.ts | carga categorías al montar |
| CP-MOB-027-06 | Hook useAdminCategories maneja error | Unit Test / Jest | useAdminCategories.test.ts | maneja error al cargar categorías |
| CP-MOB-027-07 | Hook useAdminCategories crea categoría | Unit Test / Jest | useAdminCategories.test.ts | create agrega una categoría a la lista |
| CP-MOB-027-08 | Hook useAdminCategories actualiza | Unit Test / Jest | useAdminCategories.test.ts | update actualiza una categoría en la lista |
| CP-MOB-027-09 | Hook useAdminCategories elimina | Unit Test / Jest | useAdminCategories.test.ts | remove elimina una categoría de la lista |

### CU-028: Gestionar proveedores (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-028-01 | Listar proveedores exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de ProveedorAdmin mapeados |
| CP-MOB-028-02 | Crear proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna ProveedorAdmin |
| CP-MOB-028-03 | Actualizar proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna ProveedorAdmin actualizado |
| CP-MOB-028-04 | Eliminar proveedor exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE /proveedores/:id |
| CP-MOB-028-05 | Hook useAdminSuppliers carga datos | Unit Test / Jest | useAdminSuppliers.test.ts | carga proveedores al montar |
| CP-MOB-028-06 | Hook useAdminSuppliers maneja error | Unit Test / Jest | useAdminSuppliers.test.ts | maneja error al cargar proveedores |
| CP-MOB-028-07 | Hook useAdminSuppliers crea proveedor | Unit Test / Jest | useAdminSuppliers.test.ts | create agrega un proveedor a la lista |
| CP-MOB-028-08 | Hook useAdminSuppliers actualiza | Unit Test / Jest | useAdminSuppliers.test.ts | update actualiza un proveedor en la lista |
| CP-MOB-028-09 | Hook useAdminSuppliers elimina | Unit Test / Jest | useAdminSuppliers.test.ts | remove elimina un proveedor de la lista |

### CU-029: Gestionar repartidores (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-029-01 | Listar repartidores exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de RepartidorAdmin mapeados |
| CP-MOB-029-02 | Crear repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama POST /admin/repartidores |
| CP-MOB-029-03 | Actualizar repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT /admin/repartidores/:id |
| CP-MOB-029-04 | Eliminar repartidor exitoso | Unit Test / Jest | admin.service.test.ts | llama DELETE /admin/repartidores/:id |
| CP-MOB-029-05 | Hook useAdminDrivers carga datos | Unit Test / Jest | useAdminDrivers.test.ts | carga repartidores al montar |
| CP-MOB-029-06 | Hook useAdminDrivers maneja error | Unit Test / Jest | useAdminDrivers.test.ts | maneja error al cargar repartidores |
| CP-MOB-029-07 | Hook useAdminDrivers crea repartidor | Unit Test / Jest | useAdminDrivers.test.ts | create llama createDriver y recarga |
| CP-MOB-029-08 | Hook useAdminDrivers actualiza | Unit Test / Jest | useAdminDrivers.test.ts | update llama updateDriver y recarga |
| CP-MOB-029-09 | Hook useAdminDrivers elimina | Unit Test / Jest | useAdminDrivers.test.ts | remove elimina un repartidor de la lista |

### CU-030: Gestionar roles (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-030-01 | Listar roles exitoso | Unit Test / Jest | admin.service.test.ts | retorna array de RolAdmin mapeados |
| CP-MOB-030-02 | Crear rol exitoso | Unit Test / Jest | admin.service.test.ts | llama POST y retorna RolAdmin |
| CP-MOB-030-03 | Actualizar rol exitoso | Unit Test / Jest | admin.service.test.ts | llama PUT y retorna RolAdmin actualizado |
| CP-MOB-030-04 | Hook useAdminRoles carga datos | Unit Test / Jest | useAdminRoles.test.ts | carga roles al montar |
| CP-MOB-030-05 | Hook useAdminRoles maneja error | Unit Test / Jest | useAdminRoles.test.ts | maneja error al cargar roles |
| CP-MOB-030-06 | Hook useAdminRoles crea rol | Unit Test / Jest | useAdminRoles.test.ts | create agrega un rol a la lista |
| CP-MOB-030-07 | Hook useAdminRoles actualiza rol | Unit Test / Jest | useAdminRoles.test.ts | update actualiza un rol en la lista |

### CU-031: Subir imagen de producto (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-031-01 | Subir imagen producto exitoso | Unit Test / Jest | admin.service.test.ts | sube imagen y retorna la URL |
| CP-MOB-031-02 | Subir imagen producto error servidor | Unit Test / Jest | admin.service.test.ts | lanza error cuando el servidor falla al subir |
| CP-MOB-031-03 | Entregar con evidencia exitoso | Unit Test / Jest | admin.service.test.ts | sube evidencia y marca pedido como entregado |

### CU-032: Asignar/confirmar/entregar pedido (admin)

| CP | Descripción | Tipo | Archivo | Prueba |
|----|-------------|------|---------|--------|
| CP-MOB-032-01 | Hook useAdminOrders assignOrder | Unit Test / Jest | useAdminInventory.test.ts | assignOrder actualiza el pedido en la lista |
| CP-MOB-032-02 | Hook useAdminOrders confirmOrder | Unit Test / Jest | useAdminInventory.test.ts | confirmOrder actualiza el estado del pedido |
| CP-MOB-032-03 | Hook useAdminOrders deliverOrder | Unit Test / Jest | useAdminInventory.test.ts | deliverOrder llama deliverOrderWithEvidence |

### Pruebas de Integración — Flujo (36 pruebas)

| # | Flujo | Prueba | Archivo | Descripción |
|---|-------|--------|---------|-------------|
| INT-AUTH-01 | Autenticación | Flujo completo register→login→perfil→actualizar→logout | auth-flow.integration.test.ts | Valida el flujo completo de autenticación |
| INT-AUTH-02 | Autenticación | Login falla con credenciales incorrectas | auth-flow.integration.test.ts | Verifica rechazo de credenciales inválidas |
| INT-AUTH-03 | Autenticación | ForgotPassword + resetPassword fluye correctamente | auth-flow.integration.test.ts | Valida recuperación de contraseña |
| INT-AUTH-04 | Autenticación | ForgotPassword falla con email no registrado | auth-flow.integration.test.ts | Verifica manejo de email inexistente |
| INT-AUTH-05 | Autenticación | Logout siempre limpia el token aunque falle | auth-flow.integration.test.ts | Verifica limpieza de token en error |
| INT-CART-01 | Carrito→Orden | Agregar producto al carrito + calcular totales | cart-order-flow.integration.test.ts | Verifica addItem y cálculo con delivery fee |
| INT-CART-02 | Carrito→Orden | Crear orden con items → obtener pedido en lista | cart-order-flow.integration.test.ts | Valida flujo crear→listar pedidos |
| INT-CART-03 | Carrito→Orden | Sincronizar carrito llama API por cada item | cart-order-flow.integration.test.ts | Verifica llamadas POST /carrito por item |
| INT-CART-04 | Carrito→Orden | Crear orden con items vacíos crea el pedido | cart-order-flow.integration.test.ts | Valida behavior con carrito vacío |
| INT-CART-05 | Carrito→Orden | Listar pedidos vacío retorna array | cart-order-flow.integration.test.ts | Verifica respuesta vacía |
| INT-CAT-01 | Catálogo | Listar productos retorna productos mapeados | catalog-flow.integration.test.ts | Verifica mapeo BackendProducto→Product |
| INT-CAT-02 | Catálogo | Obtener producto por ID individual | catalog-flow.integration.test.ts | Valida getProduct por ID |
| INT-CAT-03 | Catálogo | Listar categorías activas mapeadas | catalog-flow.integration.test.ts | Verifica filtro estado=1 y mapeo |
| INT-CAT-04 | Catálogo | Flujo listar→obtener detalle del primero | catalog-flow.integration.test.ts | Valida flujo completo catálogo |
| INT-CAT-05 | Catálogo | Flujo listar categorías→filtrar productos | catalog-flow.integration.test.ts | Verifica filtrado por categoría |
| INT-CAT-06 | Catálogo | Obtener producto inexistente lanza error | catalog-flow.integration.test.ts | Manejo de error 404 |
| INT-CAT-07 | Catálogo | Catálogo con respuesta vacía retorna [] | catalog-flow.integration.test.ts | Valida respuesta vacía |
| INT-CAT-08 | Catálogo | Catálogo con wrapper items funciona | catalog-flow.integration.test.ts | Verifica extracción de wrapper |
| INT-DRV-01 | Repartidor | Dashboard retorna conteo, activo y cola | driver-flow.integration.test.ts | Verifica mapeo DriverDashboard |
| INT-DRV-02 | Repartidor | Detalle retorna con productos | driver-flow.integration.test.ts | Valida DeliveryOrder con OrderProduct |
| INT-DRV-03 | Repartidor | EntregarPedido cambia estado a ENTREGADO | driver-flow.integration.test.ts | Verifica PATCH /estado |
| INT-DRV-04 | Repartidor | MarcarNoEntregado con observación | driver-flow.integration.test.ts | Valida NO_ENTREGADO con motivo |
| INT-DRV-05 | Repartidor | Flujo completo dashboard→detalle→entregar | driver-flow.integration.test.ts | Flujo end-to-end repartidor |
| INT-DRV-06 | Repartidor | Dashboard sin pedido activo retorna null | driver-flow.integration.test.ts | Valida estado vacío |
| INT-ADM-01 | Admin Panel | Listar usuarios mapeados | admin-flow.integration.test.ts | Verifica mapeo BackendUsuarioAdmin→UsuarioAdmin |
| INT-ADM-02 | Admin Panel | CRUD usuarios completo | admin-flow.integration.test.ts | create→update→delete usuario |
| INT-ADM-03 | Admin Panel | Listar categorías mapeadas | admin-flow.integration.test.ts | Verifica mapeo BackendCategoria→CategoriaAdmin |
| INT-ADM-04 | Admin Panel | CRUD categorías completo | admin-flow.integration.test.ts | create→update→delete categoría |
| INT-ADM-05 | Admin Panel | Listar proveedores mapeados | admin-flow.integration.test.ts | Verifica mapeo Proveedor |
| INT-ADM-06 | Admin Panel | CRUD proveedores completo | admin-flow.integration.test.ts | create→update→delete proveedor |
| INT-ADM-07 | Admin Panel | Listar repartidores mapeados | admin-flow.integration.test.ts | Verifica mapeo RepartidorAdmin |
| INT-ADM-08 | Admin Panel | CRUD repartidores completo | admin-flow.integration.test.ts | create→update→delete repartidor |
| INT-ADM-09 | Admin Panel | Listar roles mapeados | admin-flow.integration.test.ts | Verifica mapeo BackendRol→RolAdmin |
| INT-ADM-10 | Admin Panel | CRUD roles completo | admin-flow.integration.test.ts | create→update rol |
| INT-ADM-11 | Admin Panel | Obtener analytics retorna datos | admin-flow.integration.test.ts | Verifica AnalyticsResumen |
| INT-ADM-12 | Admin Panel | Flujo admin completo | admin-flow.integration.test.ts | Flujo end-to-end admin |

---

## 3. Resumen por Tipo de Prueba

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| Unit Test / Jest (servicio) | 110 | auth.service, profile.service, catalog.service, cart.service, order.service, delivery.service, admin.service |
| Unit Test / Jest (hook) | 47 | useAuth, useProducts, useCart, useDriverOrders, useAdminInventory, useAdminUsers, useAdminCategories, useAdminSuppliers, useAdminDrivers, useAdminRoles |
| Integration Test (flujo) | 36 | auth-flow, cart-order-flow, catalog-flow, driver-flow, admin-flow |
| **Total** | **193** | **22 archivos** |

---

## 4. Archivos de Prueba

### Unit Tests (17 archivos)

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

### Integration Tests (5 archivos)

| Archivo | Pruebas | Flujo verificado |
|---------|---------|------------------|
| auth-flow.integration.test.ts | 5 | register → login → perfil → actualizar → logout |
| cart-order-flow.integration.test.ts | 5 | addItem → totales → sincronizar → crearOrder → listarOrders |
| catalog-flow.integration.test.ts | 8 | listarProductos → listarCategorias → getProduct → wrappers |
| driver-flow.integration.test.ts | 6 | dashboard → detalle → entregar → noEntregado |
| admin-flow.integration.test.ts | 12 | CRUD usuarios/categorías/proveedores/repartidores/roles + analytics |
| **Subtotal** | **36** | |

| **TOTAL** | **193** | **22 archivos** |

---

## 5. Criterios de Aceptación

| Criterio | Estado |
|----------|--------|
| Todas las pruebas pasan al ejecutar `npm test` | ✓ |
| Cada CP corresponde a una prueba real en el código | ✓ |
| No hay CPs ficticios sin implementación | ✓ |
| Cada prueba está en un archivo TypeScript | ✓ |
| Se usa framework Jest (vía jest-expo) | ✓ |
| Se mapea CU → CP → prueba específica | ✓ |
| Los tipos de prueba reflejan lo que realmente se testeó | ✓ |

---

## 6. Notas

1. **CU-018 omitido**: No existe endpoint de historial de pedidos del repartidor en el backend móvil. No se generan CPs ficticios.

2. **Cobertura de UI**: Las pruebas cubren lógica de servicios (mapeo de datos, llamadas HTTP) y hooks de React (estado, callbacks). No hay pruebas de screens/componentes de UI.

3. **Delivery fee fijo**: Se asume $5.000 fijo para todos los tests de carrito.

4. **Mocks**: Todas las pruebas utilizan `jest.mock()` para aislar la capa de red. No se realizan llamadas HTTP reales al backend.
