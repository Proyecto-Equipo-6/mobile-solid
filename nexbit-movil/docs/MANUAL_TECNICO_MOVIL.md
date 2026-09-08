# Manual Técnico – Aplicación Móvil NexBit

Plataforma de Automatización de Pedidos Mayoristas – Remates El Paisa
Versión: 2.0
Fecha: 04/09/2026
Equipo: Samuel Arevalo, Thomas Barrero, Nicolás Aguirre, Alejandra Chaves

---

## 1. Introducción y Propósito

### 1.1 Propósito
Este manual documenta los aspectos técnicos de la **aplicación móvil NexBit**, el frontend nativo de la plataforma de Remates El Paisa. Está orientado a desarrolladores, administradores de sistemas y nuevos integrantes del equipo, con el objetivo de facilitar el mantenimiento, la construcción del APK, el despliegue y la comprensión global del módulo móvil.

### 1.2 Alcance
La aplicación móvil complementa a la plataforma web y cubre los siguientes flujos:

- **Cliente**: catálogo de productos, detalle, carrito de compras, checkout (contra entrega), historial de pedidos y edición de perfil.
- **Repartidor**: dashboard de entregas del día, detalle de pedido, inicio de entrega, subida de comprobante fotográfico (evidencia de entrega) y marcado de "no entregado".
- **Administrador**: dashboard de métricas, CRUD de productos, usuarios, categorías, proveedores, repartidores y roles; gestión de pedidos con confirmación, asignación de repartidor y entrega con evidencia fotográfica.

La app consume la misma API REST del backend Express desplegado en **Vercel** y la misma base de datos **MySQL (Railway)** que la plataforma web.

### 1.3 Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Framework | Expo SDK 57 |
| Motor de UI | React Native 0.86.2 |
| UI / Lenguaje | React 19.2.3 + TypeScript ~6.0.3 |
| Navegación | expo-router ~57.0.15 (file-based routing) |
| Almacenamiento seguro | expo-secure-store (token JWT) |
| Cámara / Galería | expo-image-picker (evidencia de entrega) |
| Íconos | @expo/vector-icons (Ionicons) |
| Build / Deploy | EAS Build (APK y App Bundle) |
| Testing | Jest 29.7.0 + jest-expo + Testing Library RN |
| Linting | ESLint (eslint-config-expo) |
| Backend consumido | Node.js + Express en Vercel |
| Base de datos | MySQL (Railway) |
| Autenticación | JWT (Bearer token en SecureStore) |

---

## 2. Arquitectura del Sistema

### 2.1 Flujo de datos general
La app móvil realiza peticiones HTTP (HTTPS) directamente a la API REST del backend Express desplegado en Vercel. El token JWT se guarda en SecureStore y se envía como cabecera `Authorization: Bearer <token>` en cada petición. El backend valida autenticación, aplica reglas de negocio y consulta MySQL. Las imágenes (evidencia de entrega, productos) se suben al backend, que las envía a Cloudinary y devuelve la URL.

```
App móvil (Expo/React Native)
        │  HTTPS (Bearer token)
        ▼
Backend Express (Vercel)  https://backend-solid-topaz.vercel.app/api/v1
        │
        ▼
MySQL (Railway)
        │
        ▼
Cloudinary (imágenes) / SMTP (correos)
```

**Base URL de la API (producción):** `https://backend-solid-topaz.vercel.app/api/v1`

Resolución de la URL en `src/shared/api/client.ts`:
1. Variable `EXPO_PUBLIC_API_URL` (inyectada por `eas.json` en el build de EAS).
2. En desarrollo, el host de `expo start` (`Constants.expoConfig.hostUri`) → `http://{host}:3000/api/v1`.
3. Fallback de producción: URL de Vercel.

### 2.2 Estructura de carpetas

```
nexbit-movil/
├── app.json                     # Configuración de Expo (slug, paquete Android, permisos)
├── eas.json                     # Perfiles de build de EAS (preview=APK, production=AAB)
├── jest.config.js               # Configuración de Jest (preset jest-expo + reporter HTML)
├── tsconfig.json                # TypeScript estricto, alias @/*
├── .env                         # Variables locales (EXPO_PUBLIC_API_URL)
├── src/
│   ├── app/                     # Router basado en archivos (expo-router)
│   │   ├── _layout.tsx          # Stack raíz + AuthProvider/CartProvider/ThemeProvider
│   │   ├── index.tsx            # Redirect por rol
│   │   ├── (auth)/              # login.tsx, register.tsx
│   │   ├── (client)/            # home, catalog, cart, checkout, orders, profile, product/[id]
│   │   ├── (admin)/             # dashboard, products, orders, users, categories, suppliers, drivers, roles
│   │   └── (driver)/            # deliveries
│   ├── features/                # Módulos funcionales
│   │   ├── auth/                # Autenticación, perfil, tipos
│   │   ├── cart/                # Carrito (en memoria) y pedidos
│   │   ├── catalog/             # Productos y categorías
│   │   ├── delivery/            # Entregas del repartidor
│   │   └── admin-panel/         # Panel administrativo
│   ├── shared/
│   │   ├── api/client.ts        # Cliente HTTP único (fetch + token + FormData)
│   │   ├── components/          # Button, Field, Pill, ThemedText/View, Alert, etc.
│   │   ├── constants/theme.ts   # Colors (light/dark), DashColors, Spacing, Radius
│   │   ├── hooks/               # useTheme, useDashTheme, useColorScheme
│   │   └── utils/               # format, imagePicker, imageUrl
│   └── __tests__/               # Pruebas de integración
├── docs/                        # Documentación del módulo móvil
└── test-report/                 # Informe HTML generado por Jest (ignorado en git)
```

### 2.3 Navegación (expo-router)

- **`src/app/index.tsx`**: redirige por rol (`ROLE_HOME`): `client → /home`, `admin → /products`, `driver → /deliveries`; sin sesión → `/login`.
- **Grupos de rutas** (los paréntesis `()` no alteran la URL):
  - `(auth)`: login, register.
  - `(client)`: Tabs (Inicio, Catálogo, Carrito, Mis pedidos, Perfil) + `checkout` y `product/[id]` ocultos (`href: null`).
  - `(admin)`: Tabs (Dashboard, Productos, Pedidos, Usuarios, Categorías, Proveedores, Repartidores, Roles) + botón de cerrar sesión en el header.
  - `(driver)`: Tab (Entregas).
- **Guardas por rol**: cada `_layout.tsx` verifica `useAuth()`: si no hay sesión → `/login`; si el rol no coincide → redirige al home del rol.
- **Nota de colisión de rutas**: `(client)/orders.tsx` y `(admin)/orders.tsx` generan la misma URL `/orders`; no hay conflicto práctico porque las guardas de rol impiden el acceso cruzado, pero es un punto a considerar al añadir nuevas rutas.

### 2.4 Temas (estilos)
- La app cliente usa **tema dinámico claro/oscuro** (`useColorScheme` + `ThemeProvider`), siguiendo el tema del sistema.
- El panel admin y driver usan **`DashColors`** (paleta oscura fija definida en `src/shared/constants/theme.ts`).

---

## 3. Modelo de Datos (lado móvil)

La app no contiene el esquema de base de datos (vive en el backend/MySQL). Define **tipos TypeScript** que reflejan la respuesta de la API, organizados por feature en `src/features/*/types/`:

| Tipo | Ubicación | Descripción |
|---|---|---|
| `Role` / `User` / `LoginResponse` | `auth/types/auth.types.ts` | Rol (`client`/`admin`/`driver`), usuario mapeado, respuesta de login |
| `CartItem` / `Order` / `OrderStatus` | `cart/types/cart.types.ts` | Ítem de carrito, pedido y estados internos |
| `Product` / `Category` | `catalog/types/catalog.types.ts` | Producto y categoría |
| `DeliveryOrder` / `DriverDashboard` | `delivery/types/delivery.types.ts` | Pedido de repartidor y dashboard |
| `RepartidorAdmin` / `UsuarioAdmin` / `AdminOrder` | `admin-panel/types/admin.types.ts` | Entidades del panel admin |

**Mapeo de roles** (`mapUsuarioToUser`): `id_rol` 1 → `admin`, 2 → `client`, 3 → `driver`.

**Mapeo de estados de pedido** (`ESTADO_ORDEN_A_INTERNO`): `PENDIENTE → pending`, `CONFIRMADO → confirmed`, `ASIGNADO → assigned`, `EN_CAMINO → in_transit`, `ENTREGADO → delivered`, `NO_ENTREGADO → not_delivered`, `CANCELADO → cancelled`.

El esquema MySQL completo (usuarios, roles, clientes, repartidores, categorías, proveedores, productos, carrito, pedidos, pedido_detalles, historial_stock, tokens_recuperacion) está documentado en el Manual Técnico Web (§3) y en `backend/DB/sistema_comercial.sql`.

---

## 4. Referencia de la API consumida

**Base URL:** `https://backend-solid-topaz.vercel.app/api/v1`
**Autenticación:** cabecera `Authorization: Bearer <token>` (JWT). Token en SecureStore (clave `nexbit_auth_token`).
**Roles:** Administrador (`id_rol=1`), Cliente (`id_rol=2`), Repartidor (`id_rol=3`).

### 4.1 Autenticación y perfil

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Inicia sesión, devuelve token |
| POST | `/users` | Registra un nuevo usuario |
| POST | `/auth/logout` | Cierra sesión |
| POST | `/auth/forgot-password` | Solicita recuperación de contraseña |
| POST | `/auth/reset-password` | Restablece contraseña con token |
| GET | `/users/perfil` | Obtiene el perfil |
| PUT | `/users/perfil` | Actualiza el perfil |

### 4.2 Cliente – Catálogo y carrito

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/productos/publico` | Lista productos del catálogo |
| GET | `/productos/{id}` | Detalle de producto |
| GET | `/categorias` | Lista categorías activas |
| GET | `/carrito` | Obtiene el carrito |
| POST | `/carrito` | Agrega producto al carrito |

### 4.3 Cliente – Pedidos

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/pedidos` | Genera pedido desde el carrito (mínimo $200.000) |
| GET | `/pedidos` | Lista histórica de pedidos |
| PATCH | `/pedidos/{id}/cancel` | Cancela pedido |

### 4.4 Repartidor

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/repartidor/dashboard` | Dashboard del día (conteo, pedido activo, cola) |
| GET | `/repartidor/pedidos/{id}/detalle` | Detalle del pedido (con productos) |
| PATCH | `/repartidor/pedidos/{id}/estado` | Cambia estado (EN_CAMINO / ENTREGADO / NO_ENTREGADO) |
| POST | `/repartidor/pedidos/{id}/comprobante` | Sube foto de entrega (form-data) |

### 4.5 Administración

Todos requieren rol administrador.

| Recurso | Método | Endpoint | Acción |
|---|---|---|---|
| Productos | GET/POST/PUT/DELETE | `/productos`, `/productos/{id}` | CRUD y subida de imagen (`POST /productos/imagen`) |
| Categorías | GET/POST/PUT/DELETE | `/categorias`, `/categorias/todas`, `/categorias/{id}` | CRUD |
| Proveedores | GET/POST/PUT/DELETE | `/proveedores`, `/proveedores/todos`, `/proveedores/{id}` | CRUD |
| Usuarios | GET/POST/PUT/DELETE | `/admin/usuarios`, `/admin/usuarios/{id}` | CRUD |
| Pedidos | GET/PUT/POST | `/admin/pedidos`, `/admin/pedidos/{id}/estado`, `.../asignar`, `.../entregar` | Listar, cambiar estado, asignar repartidor, entregar con evidencia |
| Repartidores | GET/POST/PUT/DELETE | `/admin/repartidores`, `/admin/repartidores/{id}` | CRUD y métricas |
| Roles | GET/POST/PUT | `/roles` | Listar, crear, editar |
| Analítica | GET | `/analitica/resumen` | Resumen de métricas del dashboard |

**Nota:** el filtro de pedidos por repartidor usa query params: `GET /admin/pedidos?repartidor={id}&limit=100`.

---

## 5. Guía de Instalación y Despliegue

### 5.1 Requisitos previos
- Node.js (v18+)
- npm
- Git
- Cuenta de Expo/EAS (el proyecto pertenece al owner `samx300`)
- Android Studio o un dispositivo físico (opcional, para probar el APK)
- Visual Studio Code (recomendado)

### 5.2 Clonación del código
```bash
git clone https://github.com/Proyecto-Equipo-6/mobile-solid.git
cd mobile-solid/nexbit-movil
```

### 5.3 Instalación de dependencias
```bash
npm install
```
> Existe un `.npmrc` con `legacy-peer-deps=true` para facilitar la instalación.

### 5.4 Variables de entorno (`.env`)
Copia `.env.example` a `.env`:

```env
# Producción (APK / EAS Build) — el build inyecta la URL desde eas.json
EXPO_PUBLIC_API_URL=https://backend-solid-topaz.vercel.app/api/v1

# Desarrollo local (emulador o celular físico)
# Android emulator: http://10.0.2.2:3000/api/v1
# Celular WiFi:    http://192.168.1.XXX:3000/api/v1
```

### 5.5 Desarrollo local
```bash
npx expo start
```
- Emulador Android: usar `http://10.0.2.2:3000/api/v1` (si se apunta a un backend local).
- Celular físico: usar la IP local del PC (`ipconfig` en Windows, `ifconfig` en Mac/Linux). La IP cambia al cambiar de red.

### 5.6 Build del APK (EAS Build)
```bash
eas build --platform android --profile preview
```

Perfiles definidos en `eas.json`:

| Perfil | Build | Distribución | Env |
|---|---|---|---|
| `preview` | APK | internal | `EXPO_PUBLIC_API_URL=https://backend-solid-topaz.vercel.app/api/v1` |
| `production` | App Bundle (AAB) | — | `EXPO_PUBLIC_API_URL=https://backend-solid-topaz.vercel.app/api/v1` |

### 5.7 Conexión al backend de Vercel
1. El perfil de build inyecta `EXPO_PUBLIC_API_URL` con la URL de Vercel, por lo que **el APK descargado apunta al backend de producción** sin configuración manual.
2. Adicionalmente, `src/shared/api/client.ts` tiene como **fallback de producción** la URL de Vercel, en caso de que la variable no esté presente.
3. En desarrollo, la URL se resuelve del host de `expo start` (si no hay variable), lo que permite apuntar a un backend local.

---

## 6. Reglas de Negocio (aplicadas en la app)

| ID | Regla | Dónde aplica |
|---|---|---|
| RN-006 | El correo electrónico debe ser único | Registro (backend) |
| RN-008 | Contraseña mínima 8 caracteres, una mayúscula y un número | Registro (backend) |
| RN-020 | Código de restablecimiento expira en 15 minutos | Recuperación (backend) |
| RN-027 | La cantidad en el carrito no supera el stock | Carrito/checkout (backend) |
| RN-036 | Si el producto ya existe en el carrito, se incrementa la cantidad | `CartProvider.addItem` |
| RN-044 | El pedido debe tener un total mínimo de $200.000 COP | Checkout (backend) |
| RN-065 | Estados del pedido: Asignado → En camino → Entregado | Panel repartidor |
| RN-066 | Para marcar "Entregado" es obligatoria una foto como evidencia | Panel repartidor y admin (`OrderDeliverModal`) |
| RN-078 | Solo pedidos "Confirmado" pueden asignarse a repartidor | Panel admin |
| RN-054 | El cliente solo cancela pedidos en estado PENDIENTE | `cancelOrder` |
| — | Método de pago único: contra entrega (`idMetodoPago: 1`) | Checkout (fijo) |
| — | Límite de 3 pedidos simultáneos por repartidor | Asignación (backend) |

---

## 7. Requisitos No Funcionales (RNF)

| ID | Descripción |
|---|---|
| RNF-001 | Tiempo de respuesta de los endpoints ≤ 5 segundos (el cliente HTTP usa timeout de 15s) |
| RNF-007 | Escalabilidad: soporte para 200 usuarios concurrentes y 5.000 productos |
| RNF-009 | Gestión segura de credenciales (bcrypt) e integridad de sesión (JWT en SecureStore) |
| RNF-013 | Compatibilidad con dispositivos móviles Android/iOS y web (Expo) |

**Características móviles relevantes:**
- **Token seguro**: se almacena con `expo-secure-store` (no en AsyncStorage).
- **Sesión**: al arrancar, `AuthProvider` lee el token y reconstruye el usuario con `GET /users/perfil`; si falla, se limpia la sesión y se redirige a `/login`.
- **Carrito en memoria**: `CartProvider` usa `useState`, por lo que el carrito **no sobrevive al reinicio de la app** (limitación documentada). El backend solo se sincroniza al crear el pedido.

---

## 8. Manual de Usuario (Resumen por Rol)

### 8.1 Cliente
- Registro e inicio de sesión.
- Explorar catálogo (grid 2 columnas, filtro por categoría) y ver detalle de producto.
- Agregar al carrito, ajustar cantidades y eliminar ítems.
- Checkout: dirección, notas, método contra entrega; crea el pedido.
- Ver historial de pedidos ("Mis pedidos") con estado, fecha y total.
- Ver y editar perfil; cerrar sesión.

### 8.2 Repartidor
- Dashboard de entregas: pedido activo y pedidos en cola, conteo del día.
- Iniciar entrega (ASIGNADO → EN_CAMINO).
- Subir foto de evidencia (cámara/galería) y confirmar entrega (ENTREGADO).
- Registrar "No entregado" con observación obligatoria.

### 8.3 Administrador
- Dashboard con KPIs (productos, no disponibles, pedidos, ventas) y pedidos en curso.
- CRUD de productos (con subida de imagen), categorías, proveedores, usuarios y roles.
- Gestión de pedidos: confirmar, asignar repartidor, entregar con evidencia fotográfica, ver comprobante.
- Consulta de repartidores con métricas (hoy/semana/mes) e historial de pedidos.
- Cerrar sesión desde el header.

---

## 9. Apéndices

### 9.1 Glosario de Términos Técnicos

| Término | Definición |
|---|---|
| Expo | Framework para crear aplicaciones nativas (iOS/Android) con React Native |
| expo-router | Navegación basada en archivos (file-based routing) para Expo |
| SecureStore | Almacenamiento seguro encriptado para datos sensibles (token) |
| EAS Build | Servicio en la nube de Expo para compilar APK/AAB |
| APK / AAB | Formatos de distribución Android (APK instalable; AAB para Play Store) |
| JWT | JSON Web Token – token de autenticación firmado |
| PickedImage | Imagen capturada con `expo-image-picker` (uri, base64, mimeType) |
| RN | Regla de Negocio (Business Rule) |
| RNF | Requisito No Funcional |

### 9.2 Mapeo de Estados de Pedido

```
PENDIENTE → CONFIRMADO → ASIGNADO → EN_CAMINO → ENTREGADO
                                           ↘ NO_ENTREGADO → (admin decide) CANCELADO
Cualquier estado anterior (excepto ENTREGADO) puede ir a CANCELADO.
```

### 9.3 Códigos de Estado HTTP más utilizados

| Código | Significado |
|---|---|
| 200 | OK – Solicitud exitosa |
| 201 | Created – Recurso creado correctamente |
| 400 | Bad Request – Error en los datos enviados |
| 401 | Unauthorized – No autenticado / token inválido |
| 403 | Forbidden – No tiene permisos |
| 404 | Not Found – Recurso no existe |
| 409 | Conflict – Conflicto (ej. email duplicado) |
| 500 | Internal Server Error – Error en el servidor |

### 9.4 Scripts y Archivos Clave

| Archivo/Comando | Descripción |
|---|---|
| `npm start` | `expo start` – inicia el servidor de desarrollo |
| `npm run android` | `expo start --android` |
| `npm run ios` | `expo start --ios` |
| `npm run web` | `expo start --web` |
| `npm run lint` | `expo lint` – ESLint |
| `npm test` | `jest` – ejecuta las pruebas (genera `test-report/index.html`) |
| `eas build --platform android --profile preview` | Compila el APK de prueba |
| `eas build --platform android --profile production` | Compila el AAB de producción |
| `src/shared/api/client.ts` | Cliente HTTP único (base URL, token, FormData) |
| `src/app/_layout.tsx` | Punto de entrada del router (providers) |
| `eas.json` | Perfiles de build y variables de entorno |

### 9.5 Limitaciones y Notas Conocidas

- **Carrito efímero**: se almacena en memoria; se pierde al reiniciar la app.
- **Colisión de ruta `/orders`**: `(client)/orders` y `(admin)/orders` comparten URL; las guardas de rol lo resuelven.
- **Sin auto-logout automático en 401**: la sesión se invalida al fallar `refreshUser` (GET `/users/perfil`), no por un interceptor del cliente HTTP.
- **`console.log` de debug** presentes en `delivery.service.getDashboard`, `admin.service.listAdminOrders`, `admin.service.listDrivers` y `admin.service.deliverOrderWithEvidence`.
- **Doble tema**: cliente usa claro/oscuro dinámico; admin y driver usan paleta oscura fija (`DashColors`).
- **Endpoints de carrito** (`/carrito`) existen en la app pero la UI solo los usa para sincronizar al crear el pedido.
- Los permisos de cámara/galería están configurados en `app.json` vía el plugin `expo-image-picker`.

---

## 10. Mantenimiento y Actualización del Manual

Este manual debe revisarse y actualizarse:
- Después de cada sprint (cada 2 semanas) si hay cambios significativos.
- Antes de cada release mayor (v2.0, v3.0, etc.).
- Cuando se agreguen nuevos módulos o se modifiquen reglas de negocio críticas.
- Al cambiar la URL del backend de producción (Vercel) o la configuración de `eas.json`.

Para reportar errores o sugerir mejoras en la documentación, abrir un issue en el repositorio de GitHub del proyecto.