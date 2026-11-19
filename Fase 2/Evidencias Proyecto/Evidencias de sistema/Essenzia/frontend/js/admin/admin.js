
/* =====================================================
   ESSENZIA - PANEL ADMINISTRATIVO
   Archivo: frontend/js/admin/admin.js

   MÓDULOS:
   - Dashboard
   - Productos
   - Inventario
   - Pedidos
   - Clientes
   - Reportes

   PROTOTIPO ACADÉMICO:
   Los datos de ventas, stock, pedidos y clientes
   son demostrativos.

   El catálogo de perfumes es el catálogo real
   del frontend.

   La gestión de productos funciona temporalmente
   en memoria, sin modificar perfumes.js.
===================================================== */

import { perfumes } from "../data/perfumes.js";

import {
    iniciarGestionProductos
} from "./productos-admin.js";

import { iniciarGestionInventario } from "./inventario-admin.js";

import { iniciarGestionPedidos } from "./pedidos-admin.js";

import { iniciarGestionClientes } from "./clientes-admin.js";

import { iniciarGestionReportes } from "./reportes-admin.js";

// =====================================================
// UTILIDADES
// =====================================================

const $ = (selector) => document.querySelector(selector);

const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

function CLP(numero) {
    return formatoCLP.format(Number(numero) || 0);
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(
        /[&<>"']/g,
        (caracter) => {
            const equivalencias = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return equivalencias[caracter];
        }
    );
}

// =====================================================
// CONFIGURACIÓN DE NAVEGACIÓN
// =====================================================

const secciones = [
    {
        id: "dashboard",
        nombre: "Dashboard",
        icono: "◈"
    },
    {
        id: "productos",
        nombre: "Productos",
        icono: "◉"
    },
    {
        id: "inventario",
        nombre: "Inventario",
        icono: "▤"
    },
    {
        id: "pedidos",
        nombre: "Pedidos",
        icono: "▣"
    },
    {
        id: "clientes",
        nombre: "Clientes",
        icono: "♙"
    },
    {
        id: "reportes",
        nombre: "Reportes",
        icono: "▥"
    }
];

// =====================================================
// DATOS DEMOSTRATIVOS
// =====================================================

const ventasMensuales = [
    {
        mes: "Jun",
        total: 650000
    },
    {
        mes: "Jul",
        total: 920000
    },
    {
        mes: "Ago",
        total: 780000
    },
    {
        mes: "Sep",
        total: 1350000
    },
    {
        mes: "Oct",
        total: 1780000
    },
    {
        mes: "Nov",
        total: 2450000
    }
];

const pedidosDemo = [
    {
        id: "ESS-001",
        cliente: "Cliente de ejemplo 1",
        fecha: "2026-11-05",
        total: 119990,
        estado: "Aprobado"
    },
    {
        id: "ESS-002",
        cliente: "Cliente de ejemplo 2",
        fecha: "2026-11-06",
        total: 49990,
        estado: "Pendiente"
    },
    {
        id: "ESS-003",
        cliente: "Cliente de ejemplo 3",
        fecha: "2026-11-07",
        total: 89990,
        estado: "Rechazado"
    },
    {
        id: "ESS-004",
        cliente: "Cliente de ejemplo 4",
        fecha: "2026-11-08",
        total: 329990,
        estado: "Aprobado"
    }
];

const clientesDemo = [
    {
        nombre: "Cliente de ejemplo 1",
        email: "cliente1@example.com",
        fecha: "2026-10-12",
        pedidos: 3,
        estado: "Activo"
    },
    {
        nombre: "Cliente de ejemplo 2",
        email: "cliente2@example.com",
        fecha: "2026-10-19",
        pedidos: 1,
        estado: "Activo"
    },
    {
        nombre: "Cliente de ejemplo 3",
        email: "cliente3@example.com",
        fecha: "2026-11-02",
        pedidos: 0,
        estado: "Activo"
    }
];

// Inventario temporal de demostración.
// No representa el stock real de Essenzia.

const inventarioDemo = perfumes.map(
    (perfume, indice) => {
        let stock;

        if (indice % 9 === 0) {
            stock = 0;
        } else if (indice % 5 === 0) {
            stock = 3;
        } else {
            stock = 10 + (indice % 14);
        }

        return {
            ...perfume,
            stock
        };
    }
);

// =====================================================
// NOMBRES DE CATEGORÍAS
// =====================================================

const nombresCategorias = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
};

const nombresGeneros = {
    hombre: "Hombre",
    mujer: "Mujer",
    unisex: "Unisex"
};

// =====================================================
// COMPONENTES REUTILIZABLES
// =====================================================

function estadoHTML(estado) {
    const clase = String(estado).toLowerCase();

    return `
        <span class="status ${escaparHTML(clase)}">
            ${escaparHTML(estado)}
        </span>
    `;
}

function tarjetaKPI(titulo, valor, descripcion) {
    return `
        <article class="kpi-card">

            <small>
                ${escaparHTML(titulo)}
            </small>

            <strong>
                ${escaparHTML(valor)}
            </strong>

            <span>
                ${escaparHTML(descripcion)}
            </span>

        </article>
    `;
}

function tabla(encabezados, filas) {
    return `
        <div class="table-wrap">

            <table class="admin-table">

                <thead>
                    <tr>
                        ${encabezados.map(
                            (titulo) => `
                                <th scope="col">
                                    ${escaparHTML(titulo)}
                                </th>
                            `
                        ).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${
                        filas || `
                            <tr>
                                <td colspan="${encabezados.length}">

                                    <div class="empty-message">
                                        No hay resultados para mostrar.
                                    </div>

                                </td>
                            </tr>
                        `
                    }
                </tbody>

            </table>

        </div>
    `;
}

// =====================================================
// GRÁFICO DE VENTAS
// =====================================================

function graficoVentas() {
    const maximo = Math.max(
        ...ventasMensuales.map(
            (venta) => venta.total
        )
    );

    const columnas = ventasMensuales.map((venta) => {
        const porcentaje = Math.round(
            (venta.total / maximo) * 85
        );

        return `
            <div class="chart-column">

                <div
                    class="chart-bar"
                    style="--bar-height: ${porcentaje}%"
                    title="${escaparHTML(venta.mes)}: ${CLP(venta.total)}"
                ></div>

                <small>
                    ${escaparHTML(venta.mes)}
                </small>

            </div>
        `;
    }).join("");

    return `
        <div
            class="chart-area"
            role="img"
            aria-label="Gráfico demostrativo de ventas mensuales"
        >
            ${columnas}
        </div>
    `;
}

// =====================================================
// ESTRUCTURA PRINCIPAL DEL ADMINISTRADOR
// =====================================================

function crearLayout(pagina) {
    const paginaActual = secciones.find(
        (seccion) => seccion.id === pagina
    ) || secciones[0];

    document.title =
        `${paginaActual.nombre} | Admin Essenzia`;

    const navegacion = secciones.map((seccion) => {
        const activo = pagina === seccion.id;

        return `
            <a
                href="${seccion.id}.html"
                class="${activo ? "active" : ""}"
                ${activo ? 'aria-current="page"' : ""}
            >
                <span aria-hidden="true">
                    ${seccion.icono}
                </span>

                ${escaparHTML(seccion.nombre)}
            </a>
        `;
    }).join("");

    $("#admin-app").innerHTML = `
        <div class="admin-layout">

            <!-- MENÚ LATERAL -->

            <aside class="admin-sidebar">

                <a
                    class="admin-brand"
                    href="dashboard.html"
                >
                    <img
                        src="../../img/logo-essenzia.jpg"
                        alt="Essenzia"
                    >

                    <small>
                        PANEL ADMINISTRATIVO
                    </small>
                </a>

                <nav
                    class="admin-nav"
                    aria-label="Administración"
                >
                    ${navegacion}
                </nav>

                <div class="admin-sidebar-footer">

                    <a href="../../index.html">
                        ← Volver a Essenzia
                    </a>

                </div>

            </aside>

            <!-- CONTENIDO PRINCIPAL -->

            <div class="admin-main">

                <header class="admin-topbar">

                    <div>
                        <strong>
                            Essenzia · Administración
                        </strong>

                        <small>
                            Prototipo académico · Datos de ejemplo
                        </small>
                    </div>

                    <div
                        class="admin-avatar"
                        aria-label="Administrador de demostración"
                    >
                        A
                    </div>

                </header>

                <main class="admin-content">

                    <div class="admin-heading">

                        <div>

                            <span class="admin-eyebrow">
                                GESTIÓN DE ESSENZIA
                            </span>

                            <h1>
                                ${escaparHTML(paginaActual.nombre)}
                            </h1>

                            <p id="descripcion-pagina"></p>

                        </div>

                        <span class="demo-label">
                            Modo demostración
                        </span>

                    </div>

                    <div class="admin-notice">
                        Esta es una vista de demostración.
                        Los datos de clientes, ventas, stock
                        y pedidos todavía no provienen de
                        SQLite. Los cambios en productos
                        son temporales y no afectan la tienda.
                    </div>

                    <div id="admin-contenido"></div>

                </main>

            </div>

        </div>
    `;
}

function establecerDescripcion(texto) {
    const elemento = $("#descripcion-pagina");

    if (elemento) {
        elemento.textContent = texto;
    }
}

function establecerContenido(html) {
    const elemento = $("#admin-contenido");

    if (elemento) {
        elemento.innerHTML = html;
    }
}

// =====================================================
// DASHBOARD
// =====================================================

function renderDashboard() {
    establecerDescripcion(
        "Resumen general del rendimiento de tu tienda."
    );

    const cantidadDisenador = perfumes.filter(
        (p) => p.categoria === "disenador"
    ).length;

    const cantidadArabes = perfumes.filter(
        (p) => p.categoria === "arabe"
    ).length;

    const cantidadNicho = perfumes.filter(
        (p) => p.categoria === "nicho"
    ).length;

    establecerContenido(`
        <!-- INDICADORES -->

        <div class="kpi-grid">

            ${tarjetaKPI(
                "Ventas del mes",
                CLP(2450000),
                "Ejemplo mensual"
            )}

            ${tarjetaKPI(
                "Pedidos",
                "38",
                "Ejemplo mensual"
            )}

            ${tarjetaKPI(
                "Clientes",
                "24",
                "Usuarios simulados"
            )}

            ${tarjetaKPI(
                "Perfumes",
                String(perfumes.length),
                "Catálogo real"
            )}

        </div>

        <!-- GRÁFICOS Y RESUMEN -->

        <div class="dashboard-grid">

            <section class="admin-card">

                <h2>
                    Ventas mensuales
                </h2>

                ${graficoVentas()}

            </section>

            <section class="admin-card">

                <h2>
                    Resumen de la tienda
                </h2>

                <div class="summary-list">

                    <div class="summary-row">
                        <span>Diseñador</span>
                        <strong>
                            ${cantidadDisenador} perfumes
                        </strong>
                    </div>

                    <div class="summary-row">
                        <span>Árabes</span>
                        <strong>
                            ${cantidadArabes} perfumes
                        </strong>
                    </div>

                    <div class="summary-row">
                        <span>Nicho</span>
                        <strong>
                            ${cantidadNicho} perfumes
                        </strong>
                    </div>

                    <div class="summary-row">
                        <span>Pedidos pendientes</span>
                        <strong>
                            5 (demo)
                        </strong>
                    </div>

                </div>

            </section>

        </div>

        <!-- PEDIDOS RECIENTES -->

        <section class="admin-card">

            <h2>
                Pedidos recientes
            </h2>

            ${tablaPedidos(pedidosDemo)}

        </section>
    `);
}

// =====================================================
// PRODUCTOS
// =====================================================

function renderProductos() {
    establecerDescripcion(
        "Administra el catálogo de perfumes de Essenzia."
    );

    establecerContenido(`
        <section class="admin-card">

            <!-- HERRAMIENTAS -->

            <div class="table-toolbar">

                <input
                    id="buscar-producto"
                    class="admin-search"
                    type="search"
                    placeholder="Buscar perfume o marca..."
                    aria-label="Buscar productos"
                >

                <select
                    id="filtro-categoria"
                    class="admin-select"
                    aria-label="Filtrar categoría"
                >
                    <option value="">
                        Todas las categorías
                    </option>

                    <option value="disenador">
                        Diseñador
                    </option>

                    <option value="arabe">
                        Árabe
                    </option>

                    <option value="nicho">
                        Nicho
                    </option>
                </select>

                <button
                    id="nuevo-producto"
                    class="admin-button"
                    type="button"
                >
                    + Nuevo producto
                </button>

            </div>

            <!-- CONTADOR -->

            <p
                id="contador-productos"
                class="admin-eyebrow"
            ></p>

            <!-- TABLA -->

            <div id="tabla-productos"></div>

        </section>
    `);

    /*
       IMPORTANTE:

       No agregamos aquí los eventos de búsqueda
       ni generamos la tabla de productos.

       El archivo productos-admin.js se encargará
       de todo eso.

       Así evitamos duplicar eventos y mantener
       dos versiones diferentes de la tabla.
    */
}

// =====================================================
// INVENTARIO
// =====================================================

function obtenerEstadoStock(stock) {
    if (stock === 0) {
        return "Agotado";
    }

    if (stock <= 5) {
        return "Bajo";
    }

    return "Activo";
}

function renderInventario() {
    establecerDescripcion(
        "Revisa existencias y alertas de stock."
    );

    const agotados = inventarioDemo.filter(
        (p) => p.stock === 0
    ).length;

    const bajos = inventarioDemo.filter(
        (p) => p.stock > 0 && p.stock <= 5
    ).length;

    const unidades = inventarioDemo.reduce(
        (suma, p) => suma + p.stock,
        0
    );

    establecerContenido(`
        <!-- INDICADORES -->

        <div class="kpi-grid">

            ${tarjetaKPI(
                "Productos",
                String(perfumes.length),
                "Catálogo real"
            )}

            ${tarjetaKPI(
                "Unidades",
                String(unidades),
                "Stock simulado"
            )}

            ${tarjetaKPI(
                "Stock bajo",
                String(bajos),
                "Datos simulados"
            )}

            ${tarjetaKPI(
                "Agotados",
                String(agotados),
                "Datos simulados"
            )}

        </div>

        <!-- TABLA DE INVENTARIO -->

        <section class="admin-card">

            <div class="table-toolbar">

                <h2>
                    Control de existencias
                </h2>

                <select
                    id="filtro-stock"
                    class="admin-select"
                    aria-label="Filtrar stock"
                >
                    <option value="">
                        Todos los estados
                    </option>

                    <option value="activo">
                        Disponible
                    </option>

                    <option value="bajo">
                        Stock bajo
                    </option>

                    <option value="agotado">
                        Agotado
                    </option>
                </select>

            </div>

            <div id="tabla-inventario"></div>

        </section>
    `);

    function actualizarTablaInventario() {
        const filtro = $("#filtro-stock").value;

        const lista = inventarioDemo.filter((producto) => {
            const estado = obtenerEstadoStock(
                producto.stock
            ).toLowerCase();

            return !filtro || estado === filtro;
        });

        const filas = lista.map((producto) => {
            const estado = obtenerEstadoStock(
                producto.stock
            );

            return `
                <tr>

                    <td>
                        #${producto.id}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(producto.nombre)}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(producto.marca)}
                    </td>

                    <td>
                        ${producto.stock}
                    </td>

                    <td>
                        ${estadoHTML(estado)}
                    </td>

                </tr>
            `;
        }).join("");

        $("#tabla-inventario").innerHTML = tabla(
            [
                "ID",
                "Perfume",
                "Marca",
                "Unidades",
                "Estado"
            ],
            filas
        );
    }

    $("#filtro-stock").addEventListener(
        "change",
        actualizarTablaInventario
    );

    actualizarTablaInventario();
}

// =====================================================
// PEDIDOS
// =====================================================

function tablaPedidos(lista) {
    const filas = lista.map((pedido) => `
        <tr>

            <td>
                <strong>
                    ${escaparHTML(pedido.id)}
                </strong>
            </td>

            <td>
                ${escaparHTML(pedido.cliente)}
            </td>

            <td>
                ${escaparHTML(pedido.fecha)}
            </td>

            <td>
                ${CLP(pedido.total)}
            </td>

            <td>
                ${estadoHTML(pedido.estado)}
            </td>

        </tr>
    `).join("");

    return tabla(
        [
            "Pedido",
            "Cliente",
            "Fecha",
            "Total",
            "Estado"
        ],
        filas
    );
}

function renderPedidos() {
    establecerDescripcion(
        "Consulta los pedidos y sus estados de pago."
    );

    establecerContenido(`
        <section class="admin-card">

            <div class="table-toolbar">

                <h2>
                    Listado de pedidos
                </h2>

                <select
                    id="filtro-pedidos"
                    class="admin-select"
                    aria-label="Filtrar pedidos"
                >
                    <option value="">
                        Todos los estados
                    </option>

                    <option value="Aprobado">
                        Aprobados
                    </option>

                    <option value="Pendiente">
                        Pendientes
                    </option>

                    <option value="Rechazado">
                        Rechazados
                    </option>

                </select>

            </div>

            <div id="tabla-pedidos"></div>

        </section>
    `);

    function actualizarTablaPedidos() {
        const filtro = $("#filtro-pedidos").value;

        const lista = pedidosDemo.filter(
            (pedido) =>
                !filtro || pedido.estado === filtro
        );

        $("#tabla-pedidos").innerHTML =
            tablaPedidos(lista);
    }

    $("#filtro-pedidos").addEventListener(
        "change",
        actualizarTablaPedidos
    );

    actualizarTablaPedidos();
}

// =====================================================
// CLIENTES
// =====================================================

function renderClientes() {
    establecerDescripcion(
        "Consulta los clientes registrados en Essenzia."
    );

    const filas = clientesDemo.map((cliente) => `
        <tr>

            <td>
                <strong>
                    ${escaparHTML(cliente.nombre)}
                </strong>
            </td>

            <td>
                ${escaparHTML(cliente.email)}
            </td>

            <td>
                ${escaparHTML(cliente.fecha)}
            </td>

            <td>
                ${cliente.pedidos}
            </td>

            <td>
                ${estadoHTML(cliente.estado)}
            </td>

        </tr>
    `).join("");

    establecerContenido(`
        <section class="admin-card">

            <h2>
                Clientes de demostración
            </h2>

            ${tabla(
                [
                    "Nombre",
                    "Correo electrónico",
                    "Fecha de registro",
                    "Pedidos",
                    "Estado"
                ],
                filas
            )}

        </section>
    `);
}

// =====================================================
// REPORTES
// =====================================================

function renderReportes() {
    establecerDescripcion(
        "Analiza las ventas y estadísticas de Essenzia."
    );

    const totalVentas = ventasMensuales.reduce(
        (suma, venta) => suma + venta.total,
        0
    );

    const promedioMensual = Math.round(
        totalVentas / ventasMensuales.length
    );

    const categorias = [
        "disenador",
        "arabe",
        "nicho"
    ];

    const resumenCategorias = categorias.map(
        (categoria) => {
            const cantidad = perfumes.filter(
                (p) => p.categoria === categoria
            ).length;

            return `
                <div class="summary-row">

                    <span>
                        ${escaparHTML(
                            nombresCategorias[categoria]
                        )}
                    </span>

                    <strong>
                        ${cantidad} perfumes
                    </strong>

                </div>
            `;
        }
    ).join("");

    const filasVentas = ventasMensuales.map(
        (venta) => `
            <tr>

                <td>
                    ${escaparHTML(venta.mes)}
                </td>

                <td>
                    ${CLP(venta.total)}
                </td>

            </tr>
        `
    ).join("");

    establecerContenido(`
        <!-- INDICADORES -->

        <div class="kpi-grid">

            ${tarjetaKPI(
                "Ventas acumuladas",
                CLP(totalVentas),
                "Datos demostrativos"
            )}

            ${tarjetaKPI(
                "Promedio mensual",
                CLP(promedioMensual),
                "Datos demostrativos"
            )}

            ${tarjetaKPI(
                "Meses analizados",
                String(ventasMensuales.length),
                "Datos demostrativos"
            )}

            ${tarjetaKPI(
                "Categorías",
                "3",
                "Catálogo real"
            )}

        </div>

        <!-- GRÁFICO Y DISTRIBUCIÓN -->

        <div class="dashboard-grid">

            <section class="admin-card">

                <h2>
                    Evolución de ventas
                </h2>

                ${graficoVentas()}

            </section>

            <section class="admin-card">

                <h2>
                    Distribución del catálogo
                </h2>

                <div class="summary-list">
                    ${resumenCategorias}
                </div>

            </section>

        </div>

        <!-- TABLA DE VENTAS -->

        <section class="admin-card">

            <h2>
                Ventas por mes
            </h2>

            ${tabla(
                [
                    "Mes",
                    "Ventas demostrativas"
                ],
                filasVentas
            )}

        </section>
    `);
}


 // =====================================================
 // INICIALIZACIÓN DEL PANEL ADMINISTRATIVO
 // =====================================================

 const API_AUTH = "http://localhost:3000/api/auth";

 // -----------------------------------------------------
 // VERIFICAR SESIÓN Y PERMISOS
 // -----------------------------------------------------

 async function verificarAdministrador() {
     const contenedor = $("#admin-app");

     contenedor.textContent =
         "Verificando permisos de administración...";

     try {
         const respuesta = await fetch(`${API_AUTH}/me`, {
             method: "GET",
             credentials: "include",
             cache: "no-store"
         });

         // Usuario sin sesión iniciada
         if (respuesta.status === 401) {
             window.location.replace("../auth/login.html");
             return null;
         }

         // Error del servidor
         if (!respuesta.ok) {
             throw new Error(
                 `Error HTTP ${respuesta.status}`
             );
         }

         const datos = await respuesta.json();
         const usuario = datos.usuario;

         // Comprobar que exista el usuario
         if (!usuario) {
             window.location.replace("../auth/login.html");
             return null;
         }

         // Comprobar permisos administrativos
         if (usuario.rol !== "admin") {
             contenedor.innerHTML = `
                 <main style="
                     max-width: 560px;
                     margin: 80px auto;
                     padding: 24px;
                     font-family: Arial, sans-serif;
                     text-align: center;
                 ">
                     <h1>Acceso restringido</h1>

                     <p>
                         Tu cuenta no tiene permisos
                         para administrar Essenzia.
                     </p>

                     <a href="../../index.html">
                         Volver a la tienda
                     </a>
                 </main>
             `;

             return null;
         }

         return usuario;

     } catch (error) {
         console.error(
             "Error al verificar administrador:",
             error
         );

         contenedor.innerHTML = `
             <main style="
                 max-width: 560px;
                 margin: 80px auto;
                 padding: 24px;
                 font-family: Arial, sans-serif;
                 text-align: center;
             ">
                 <h1>No se pudo verificar la sesión</h1>

                 <p>
                     Comprueba que el backend
                     esté funcionando.
                 </p>

                 <a href="../../index.html">
                     Volver a la tienda
                 </a>
             </main>
         `;

         return null;
     }
 }

 // -----------------------------------------------------
 // INICIAR PANEL ADMINISTRATIVO
 // -----------------------------------------------------

 async function iniciarAdmin() {
     const contenedor = $("#admin-app");

     if (!contenedor) {
         console.error(
             "Essenzia Admin: no existe #admin-app."
         );

         return;
     }

     // Verificar sesión antes de mostrar contenido
     const usuario = await verificarAdministrador();

     if (!usuario) {
         return;
     }

     // Identificar sección actual
     const pagina =
         document.body.dataset.adminPage || "dashboard";

     // Crear estructura administrativa
     crearLayout(pagina);

     // Mostrar inicial del administrador
     const avatar = $(".admin-avatar");

     if (avatar) {
         const nombre = usuario.nombre || "Administrador";

         avatar.textContent =
             nombre.trim().charAt(0).toUpperCase();

         avatar.setAttribute(
             "aria-label",
             `Administrador: ${nombre}`
         );

         avatar.title = nombre;
     }

     // -------------------------------------------------
     // CARGAR SECCIÓN CORRESPONDIENTE
     // -------------------------------------------------

     switch (pagina) {

         case "dashboard":
             renderDashboard();
             break;

         case "productos":
             renderProductos();
             iniciarGestionProductos();
             break;

         case "inventario":
             iniciarGestionInventario();
             break;

         case "pedidos":
             iniciarGestionPedidos();
             break;

         case "clientes":
             iniciarGestionClientes();
             break;

         case "reportes":
             iniciarGestionReportes();
             break;

         default:
             renderDashboard();
             break;
     }

     console.log(
         `Essenzia Admin: sección "${pagina}" cargada.`
     );

     console.log(
         `Administrador autenticado: ${usuario.nombre}`
     );
 }

 // =====================================================
 // INICIAR CUANDO EL DOM ESTÉ DISPONIBLE
 // =====================================================

 if (document.readyState === "loading") {

     document.addEventListener(
         "DOMContentLoaded",
         iniciarAdmin
     );

 } else {

     iniciarAdmin();

 }
