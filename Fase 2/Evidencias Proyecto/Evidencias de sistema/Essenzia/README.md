# ESSENZIA
### Plataforma de comercio electrónico de perfumería

**Proyecto CAPSTONE — Ingeniería en Informática**

**Estado:** En desarrollo

## 1. Descripción del proyecto

Essenzia es una plataforma web de comercio electrónico especializada en la venta de perfumes de diseñador, árabes y de nicho.

El sistema busca ofrecer una experiencia de compra intuitiva y personalizada, incorporando un catálogo de productos, recomendaciones según preferencias olfativas, carrito de compras, autenticación de usuarios, gestión administrativa e integración de pagos en línea.

El proyecto se desarrolla como parte de CAPSTONE de Ingeniería en Informática.

## 2. Integrantes y roles

| Integrante | Rol | Responsabilidades |
|---|---|---|
| Manuel Pinto | Desarrollador Full Stack y responsable técnico | Diseño e implementación del frontend y backend, integración de servicios, base de datos, autenticación, inventario y pruebas técnicas. |
| Alexander Andrades | Encargado de documentación y seguimiento | Elaboración de documentación técnica y funcional, organización de evidencias, informes, seguimiento de avances y apoyo en presentaciones. |

## 3. Tecnologías utilizadas

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- API REST

### Base de datos
- SQLite

### Integraciones
- Mercado Pago Checkout Pro mediante Orders API.
- Verificación de pagos mediante las API de Mercado Pago.

### Herramientas de desarrollo
- Visual Studio Code.
- Git y GitHub.
- Live Server.

## 4. Funcionalidades desarrolladas

### Módulo de clientes
- Catálogo de perfumes.
- Búsqueda y filtrado de productos.
- Visualización de detalles de perfumes.
- Essenzia Match: recomendaciones personalizadas.
- Carrito de compras.
- Registro e inicio de sesión.
- Gestión de cuenta de usuario.

### Módulo administrativo
- Panel de administración.
- Gestión de productos.
- Control de inventario.
- Registro de movimientos de stock.
- Gestión y seguimiento de pedidos.
- Módulos de clientes y reportes.

### Integración de pagos
- Creación de órdenes de compra.
- Integración con Mercado Pago en entorno TEST.
- Verificación del estado de los pagos.
- Registro de pedidos en SQLite.
- Descuento de inventario tras la confirmación del pago.

**Nota:** Algunas funcionalidades continúan en desarrollo o requieren pruebas adicionales.

## 5. Requisitos de instalación

Para ejecutar el proyecto en otro computador se necesitan:

| Programa | Uso |
|---|---|
| Node.js | Ejecutar el servidor backend. |
| npm | Instalar las dependencias del proyecto. |
| Navegador web | Acceder a la plataforma. |
| Git | Clonar el repositorio desde GitHub. |
| Visual Studio Code | Editor recomendado para desarrollo. |
| Live Server | Servir el frontend durante las pruebas locales. |

Se recomienda utilizar una versión LTS de Node.js compatible con las dependencias del proyecto.

SQLite es utilizado mediante la implementación de base de datos del backend. No se requiere instalar un servidor independiente de SQLite.

## 6. Descargar el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/basslex/2026_2_MA_CAPSTONE_005D_GRUPO_5.git
```

Entrar a la carpeta descargada:

```bash
cd 2026_2_MA_CAPSTONE_005D_GRUPO_5
```

Cambiar a la rama de evidencias:

```bash
git switch evidencias-essenzia
```

Ubicar el proyecto en:

```text
Fase 2/
└── Evidencias Proyecto/
    └── Evidencias de sistema/
        └── Essenzia/
            ├── backend/
            └── frontend/
```

## 7. Instalar las dependencias

Abrir una terminal en la carpeta `backend` y ejecutar:

```bash
npm install
```

Este comando instalará las dependencias declaradas en `package.json`, entre ellas:

- express
- cors
- dotenv
- argon2

No es necesario copiar la carpeta `node_modules` desde otro computador.

## 8. Configuración del entorno

Crear un archivo llamado `.env` dentro de `backend`.

Configuración básica:

```dotenv
PORT=3000
MP_ENV=TEST
MP_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_PRUEBA
```

El backend requiere un Access Token válido de Mercado Pago en entorno de pruebas.

El archivo `.env` puede necesitar variables adicionales según los módulos utilizados, especialmente autenticación, notificaciones y configuración de URLs.

**Seguridad:** nunca publicar contraseñas, claves privadas o Access Tokens reales en GitHub.

## 9. Inicialización de la base de datos

El proyecto utiliza SQLite para almacenar productos, usuarios, pedidos e inventario.

Desde `backend`, ejecutar:

```bash
npm run db:init
```

Este comando ejecuta el script:

```text
backend/db/inicializar.js
```

El proyecto también incluye scripts para importar productos e inicializar los módulos de pedidos e inventario.

La preparación completa de una base de datos nueva debe comprobarse según los requisitos de esos scripts antes de realizar pruebas de compra.

## 10. Ejecutar el backend

Desde la carpeta `backend`:

```bash
npm start
```

También es posible iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Dirección local predeterminada:

```text
http://localhost:3000
```

Al acceder a esta dirección, el servidor debería responder con información sobre el estado del backend.

## 11. Ejecutar el frontend

1. Abrir el proyecto en Visual Studio Code.
2. Instalar la extensión Live Server, si es necesario.
3. Abrir `frontend/index.html`.
4. Seleccionar **Open with Live Server**.

Dirección utilizada durante el desarrollo:

```text
http://localhost:5500/frontend/index.html
```

El puerto puede variar dependiendo de la configuración del entorno.

## 12. Pruebas de Mercado Pago

Essenzia utiliza Mercado Pago en entorno TEST.

Para realizar pruebas de compra se requiere:

- Configurar credenciales de prueba válidas.
- Ejecutar el backend y frontend.
- Seleccionar productos con stock disponible.
- Utilizar los medios de pago de prueba proporcionados por Mercado Pago.
- Verificar el estado de la orden generada.

La consulta de verificación de órdenes se realiza mediante:

```text
GET /api/pagos/orden/:orderId
```

Esta ruta se utiliza actualmente durante el desarrollo para consultar y verificar pagos, y puede actualizar el estado del pedido y el inventario.

**Importante:** no utilizar tarjetas bancarias reales para las pruebas. La validación de notificaciones automáticas mediante webhooks continúa en desarrollo.

## 13. Estructura del proyecto

```text
Essenzia/
├── backend/
│   ├── data/
│   ├── db/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   ├── img/
│   ├── js/
│   ├── pages/
│   └── index.html
└── README.md
```

## 14. Estado actual y próximos avances

El proyecto se encuentra en etapa de desarrollo y validación de funcionalidades.

Entre los avances realizados se encuentran la implementación del catálogo, autenticación, administración de productos, inventario, pedidos e integración de pagos de prueba.

Los próximos trabajos contemplan:

- Mejorar la automatización de notificaciones de Mercado Pago.
- Fortalecer la seguridad de los endpoints.
- Completar las pruebas de integración.
- Mejorar la experiencia de usuario.
- Preparar el sistema para su despliegue.

## 15. Repositorio del proyecto

**CAPSTONE — Grupo 5**

https://github.com/basslex/2026_2_MA_CAPSTONE_005D_GRUPO_5

**Rama de evidencias:** `evidencias-essenzia`

**Proyecto:** Essenzia

**Integrantes:** Manuel Pinto y Alexander Andrades.