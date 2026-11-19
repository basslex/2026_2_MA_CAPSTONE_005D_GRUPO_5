
/* =====================================================
   ESSENZIA - REPORTES ADMINISTRATIVOS
   Archivo: frontend/js/admin/reportes-admin.js

   PROTOTIPO ACADÉMICO
   - Ventas y estadísticas simuladas
   - Filtros por período
   - Gráficos de ventas
   - Productos más vendidos
   - Ventas por categoría
   - Exportación CSV
   - Sin conexión a SQLite
===================================================== */

import { perfumes } from "../data/perfumes.js";

const $ = selector => document.querySelector(selector);

const CLP = numero => new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
}).format(numero);

const MESES = [
    { id: "2026-06", nombre: "Junio" },
    { id: "2026-07", nombre: "Julio" },
    { id: "2026-08", nombre: "Agosto" },
    { id: "2026-09", nombre: "Septiembre" },
    { id: "2026-10", nombre: "Octubre" },
    { id: "2026-11", nombre: "Noviembre" }
];

const CATEGORIAS = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
};

const COLORES = {
    disenador: "#d4af37",
    arabe: "#0f0f0f",
    nicho: "#c47f5a"
};

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

// =====================================================
// DATOS DE DEMOSTRACIÓN
// =====================================================

// Estos valores son simulados y NO representan
// ventas reales ni transacciones de Mercado Pago.

const resumenMensual = [
    { mes: "2026-06", ventas: 650000, pedidos: 12 },
    { mes: "2026-07", ventas: 920000, pedidos: 17 },
    { mes: "2026-08", ventas: 780000, pedidos: 14 },
    { mes: "2026-09", ventas: 1350000, pedidos: 23 },
    { mes: "2026-10", ventas: 1780000, pedidos: 31 },
    { mes: "2026-11", ventas: 2450000, pedidos: 38 }
];

// Distribución simulada por categoría.
// Las tres categorías suman el total mensual.

const distribucionMensual = {
    "2026-06": {
        disenador: 300000,
        arabe: 200000,
        nicho: 150000
    },
    "2026-07": {
        disenador: 420000,
        arabe: 260000,
        nicho: 240000
    },
    "2026-08": {
        disenador: 340000,
        arabe: 240000,
        nicho: 200000
    },
    "2026-09": {
        disenador: 560000,
        arabe: 390000,
        nicho: 400000
    },
    "2026-10": {
        disenador: 720000,
        arabe: 480000,
        nicho: 580000
    },
    "2026-11": {
        disenador: 950000,
        arabe: 650000,
        nicho: 850000
    }
};

// Unidades simuladas por mes y producto.
// Usamos IDs del catálogo real de perfumes.js.

const unidadesMensuales = {
    "2026-06": {
        1: 4, 11: 6, 15: 5, 21: 2, 23: 2, 3: 3
    },
    "2026-07": {
        1: 6, 11: 7, 15: 5, 21: 3, 23: 3, 3: 4
    },
    "2026-08": {
        1: 5, 11: 6, 15: 6, 21: 2, 23: 3, 3: 4
    },
    "2026-09": {
        1: 8, 11: 9, 15: 7, 21: 4, 23: 5, 3: 6
    },
    "2026-10": {
        1: 10, 11: 12, 15: 9, 21: 5, 23: 7, 3: 8
    },
    "2026-11": {
        1: 14, 11: 15, 15: 12, 21: 7, 23: 9, 3: 10
    }
};

// =====================================================
// ESTADO DEL REPORTE
// =====================================================

let periodoSeleccionado = "todos";

// =====================================================
// OBTENER DATOS FILTRADOS
// =====================================================

function obtenerMesesFiltrados() {
    if (periodoSeleccionado === "todos") {
        return MESES.map(mes => mes.id);
    }

    return MESES
        .filter(mes => mes.id === periodoSeleccionado)
        .map(mes => mes.id);
}

function obtenerResumen() {
    const meses = obtenerMesesFiltrados();

    return resumenMensual.filter(
        registro => meses.includes(registro.mes)
    );
}

function obtenerTotales() {
    const resumen = obtenerResumen();

    const ventas = resumen.reduce(
        (suma, registro) => suma + registro.ventas,
        0
    );

    const pedidos = resumen.reduce(
        (suma, registro) => suma + registro.pedidos,
        0
    );

    return {
        ventas,
        pedidos,
        promedio: pedidos > 0
            ? Math.round(ventas / pedidos)
            : 0,
        meses: resumen.length
    };
}

function obtenerCategorias() {
    const resultado = {
        disenador: 0,
        arabe: 0,
        nicho: 0
    };

    for (const mes of obtenerMesesFiltrados()) {
        const datos = distribucionMensual[mes];

        for (const categoria of Object.keys(resultado)) {
            resultado[categoria] += datos[categoria] || 0;
        }
    }

    return resultado;
}

function obtenerRanking() {
    const unidades = new Map();

    for (const mes of obtenerMesesFiltrados()) {
        const registros = unidadesMensuales[mes] || {};

        for (const [id, cantidad] of Object.entries(registros)) {
            const clave = Number(id);

            unidades.set(
                clave,
                (unidades.get(clave) || 0) + cantidad
            );
        }
    }

    return [...unidades.entries()]
        .map(([id, cantidad]) => {
            const producto = perfumes.find(
                perfume => perfume.id === id
            );

            return producto
                ? { ...producto, unidades: cantidad }
                : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.unidades - a.unidades);
}

// =====================================================
// VISTA PRINCIPAL
// =====================================================

function crearVista() {
    $("#admin-contenido").innerHTML = `
        <section class="admin-card reportes-toolbar">

            <div>
                <h2>Estadísticas de ventas</h2>
                <p class="reportes-subtitle">
                    Información demostrativa de Essenzia.
                </p>
            </div>

            <div class="reportes-controls">

                <label for="filtro-periodo">
                    Período
                </label>

                <select
                    id="filtro-periodo"
                    class="admin-select"
                >
                    <option value="todos">
                        Todos los meses
                    </option>

                    ${MESES.map(mes => `
                        <option value="${mes.id}">
                            ${mes.nombre} 2026
                        </option>
                    `).join("")}
                </select>

                <button
                    type="button"
                    id="exportar-reporte"
                    class="admin-button"
                >
                    Exportar CSV
                </button>

            </div>

        </section>

        <div
            id="reportes-indicadores"
            class="kpi-grid"
        ></div>

        <div class="dashboard-grid">

            <section class="admin-card">
                <h2>Evolución de ventas</h2>
                <div id="grafico-ventas-reporte"></div>
            </section>

            <section class="admin-card">
                <h2>Ventas por categoría</h2>
                <div id="grafico-categorias"></div>
            </section>

        </div>

        <section class="admin-card">
            <h2>Productos más vendidos</h2>
            <div id="ranking-productos"></div>
        </section>

        <section class="admin-card">
            <h2>Resumen mensual</h2>
            <div id="tabla-resumen-reporte"></div>
        </section>
    `;
}

// =====================================================
// INDICADORES
// =====================================================

function renderIndicadores() {
    const datos = obtenerTotales();

    $("#reportes-indicadores").innerHTML = `
        <article class="kpi-card">
            <small>Ingresos</small>
            <strong>${CLP(datos.ventas)}</strong>
            <span>Ventas demostrativas</span>
        </article>

        <article class="kpi-card">
            <small>Pedidos</small>
            <strong>${datos.pedidos}</strong>
            <span>Pedidos simulados</span>
        </article>

        <article class="kpi-card">
            <small>Ticket promedio</small>
            <strong>${CLP(datos.promedio)}</strong>
            <span>Ingreso promedio por pedido</span>
        </article>

        <article class="kpi-card">
            <small>Meses analizados</small>
            <strong>${datos.meses}</strong>
            <span>Período seleccionado</span>
        </article>
    `;
}

// =====================================================
// GRÁFICO DE VENTAS
// =====================================================

function renderGraficoVentas() {
    const datos = obtenerResumen();

    const maximo = Math.max(
        1,
        ...datos.map(registro => registro.ventas)
    );

    const columnas = datos.map(registro => {
        const mes = MESES.find(
            item => item.id === registro.mes
        );

        const altura = Math.max(
            5,
            Math.round((registro.ventas / maximo) * 100)
        );

        return `
            <div class="reportes-chart-column">

                <div class="reportes-chart-value">
                    ${CLP(registro.ventas)}
                </div>

                <div class="reportes-chart-track">

                    <div
                        class="reportes-chart-bar"
                        style="height: ${altura}%"
                        title="${CLP(registro.ventas)}"
                    ></div>

                </div>

                <small>
                    ${escapar(mes?.nombre || registro.mes)}
                </small>

            </div>
        `;
    }).join("");

    $("#grafico-ventas-reporte").innerHTML = `
        <div class="reportes-chart">
            ${columnas}
        </div>
    `;
}

// =====================================================
// VENTAS POR CATEGORÍA
// =====================================================

function renderCategorias() {
    const categorias = obtenerCategorias();

    const total = Object.values(categorias).reduce(
        (suma, valor) => suma + valor,
        0
    );

    const contenido = Object.entries(categorias)
        .map(([categoria, ventas]) => {
            const porcentaje = total > 0
                ? (ventas / total) * 100
                : 0;

            return `
                <div class="reportes-category-item">

                    <div class="reportes-category-heading">

                        <span>
                            <i
                                class="reportes-category-dot"
                                style="background: ${COLORES[categoria]}"
                            ></i>

                            ${CATEGORIAS[categoria]}
                        </span>

                        <strong>
                            ${CLP(ventas)}
                        </strong>

                    </div>

                    <div class="reportes-progress">

                        <div
                            class="reportes-progress-fill"
                            style="
                                width: ${porcentaje}%;
                                background: ${COLORES[categoria]};
                            "
                        ></div>

                    </div>

                    <small>
                        ${porcentaje.toFixed(1)}% de las ventas
                    </small>

                </div>
            `;
        }).join("");

    $("#grafico-categorias").innerHTML = `
        <div class="reportes-categories">
            ${contenido}
        </div>
    `;
}

// =====================================================
// RANKING DE PRODUCTOS
// =====================================================

function renderRanking() {
    const ranking = obtenerRanking().slice(0, 6);

    const maximo = Math.max(
        1,
        ...ranking.map(producto => producto.unidades)
    );

    const filas = ranking.map((producto, indice) => {
        const porcentaje =
            (producto.unidades / maximo) * 100;

        return `
            <div class="reportes-ranking-row">

                <span class="reportes-ranking-position">
                    ${indice + 1}
                </span>

                <div class="reportes-ranking-product">

                    <strong>
                        ${escapar(producto.nombre)}
                    </strong>

                    <small>
                        ${escapar(producto.marca)}
                    </small>

                    <div class="reportes-progress">
                        <div
                            class="reportes-progress-fill"
                            style="
                                width: ${porcentaje}%;
                                background: #d4af37;
                            "
                        ></div>
                    </div>

                </div>

                <strong class="reportes-ranking-units">
                    ${producto.unidades} uds.
                </strong>

            </div>
        `;
    }).join("");

    $("#ranking-productos").innerHTML =
        filas || "<p>No hay datos disponibles.</p>";
}

// =====================================================
// TABLA DE RESUMEN
// =====================================================

function renderTablaResumen() {
    const filas = obtenerResumen().map(registro => {
        const mes = MESES.find(
            item => item.id === registro.mes
        );

        const promedio = registro.pedidos > 0
            ? registro.ventas / registro.pedidos
            : 0;

        return `
            <tr>
                <td>
                    ${escapar(mes?.nombre || registro.mes)}
                </td>

                <td>
                    ${registro.pedidos}
                </td>

                <td>
                    ${CLP(registro.ventas)}
                </td>

                <td>
                    ${CLP(promedio)}
                </td>
            </tr>
        `;
    }).join("");

    $("#tabla-resumen-reporte").innerHTML = `
        <div class="table-wrap">

            <table class="admin-table">

                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Pedidos</th>
                        <th>Ingresos</th>
                        <th>Ticket promedio</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas}
                </tbody>

            </table>

        </div>
    `;
}

// =====================================================
// EXPORTAR CSV
// =====================================================

function escaparCSV(valor) {
    const texto = String(valor ?? "");

    // Evita que Excel interprete valores como fórmulas.
    const seguro = /^[\s]*[=+\-@]/.test(texto)
        ? "'" + texto
        : texto;

    return `"${seguro.replace(/"/g, '""')}"`;
}

function exportarCSV() {
    const filas = [
        [
            "Mes",
            "Pedidos",
            "Ingresos CLP",
            "Ticket promedio CLP"
        ]
    ];

    for (const registro of obtenerResumen()) {
        const mes = MESES.find(
            item => item.id === registro.mes
        );

        filas.push([
            `${mes?.nombre || registro.mes} 2026`,
            registro.pedidos,
            registro.ventas,
            registro.pedidos > 0
                ? Math.round(
                    registro.ventas / registro.pedidos
                )
                : 0
        ]);
    }

    const contenido = filas
        .map(fila => fila.map(escaparCSV).join(";"))
        .join("\r\n");

    // BOM UTF-8 para compatibilidad con Excel.
    const archivo = new Blob(
        ["\uFEFF" + contenido],
        {
            type: "text/csv;charset=utf-8;"
        }
    );

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download =
        `essenzia-reporte-${periodoSeleccionado}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);
}

// =====================================================
// ACTUALIZAR REPORTE
// =====================================================

function actualizarReportes() {
    renderIndicadores();
    renderGraficoVentas();
    renderCategorias();
    renderRanking();
    renderTablaResumen();
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

export function iniciarGestionReportes() {
    if (!$("#admin-contenido")) return;

    periodoSeleccionado = "todos";

    crearVista();
    actualizarReportes();

    $("#filtro-periodo").addEventListener(
        "change",
        evento => {
            periodoSeleccionado = evento.target.value;
            actualizarReportes();
        }
    );

    $("#exportar-reporte").addEventListener(
        "click",
        exportarCSV
    );
}
