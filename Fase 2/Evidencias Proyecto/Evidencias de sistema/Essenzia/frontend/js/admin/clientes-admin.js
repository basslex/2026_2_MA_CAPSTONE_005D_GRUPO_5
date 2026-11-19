
/* =====================================================
   ESSENZIA - GESTIÓN DE CLIENTES
   Archivo: frontend/js/admin/clientes-admin.js

   PROTOTIPO ACADÉMICO
   - Clientes de demostración
   - Búsqueda y filtros
   - Ficha de cliente
   - Historial de compras
   - Sin conexión a SQLite
===================================================== */

const $ = selector => document.querySelector(selector);

const CLP = numero => new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
}).format(numero);

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

const clientes = [
    {
        id: 1,
        nombre: "Cliente de ejemplo 1",
        email: "cliente1@example.com",
        telefono: "+56 9 0000 0001",
        registro: "2026-10-12",
        estado: "Activo",
        pedidos: [
            {
                id: "ESS-001",
                fecha: "2026-11-05",
                total: 119990,
                estado: "Aprobado"
            },
            {
                id: "ESS-005",
                fecha: "2026-10-25",
                total: 49990,
                estado: "Aprobado"
            },
            {
                id: "ESS-006",
                fecha: "2026-10-18",
                total: 89990,
                estado: "Aprobado"
            }
        ]
    },
    {
        id: 2,
        nombre: "Cliente de ejemplo 2",
        email: "cliente2@example.com",
        telefono: "+56 9 0000 0002",
        registro: "2026-10-19",
        estado: "Activo",
        pedidos: [
            {
                id: "ESS-002",
                fecha: "2026-11-06",
                total: 49990,
                estado: "Pendiente"
            }
        ]
    },
    {
        id: 3,
        nombre: "Cliente de ejemplo 3",
        email: "cliente3@example.com",
        telefono: "+56 9 0000 0003",
        registro: "2026-11-02",
        estado: "Activo",
        pedidos: []
    },
    {
        id: 4,
        nombre: "Cliente de ejemplo 4",
        email: "cliente4@example.com",
        telefono: "+56 9 0000 0004",
        registro: "2026-11-04",
        estado: "Activo",
        pedidos: [
            {
                id: "ESS-004",
                fecha: "2026-11-08",
                total: 329990,
                estado: "Aprobado"
            }
        ]
    }
];

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function totalGastado(cliente) {
    return cliente.pedidos
        .filter(pedido => pedido.estado === "Aprobado")
        .reduce((total, pedido) => total + pedido.total, 0);
}

function totalPedidos(cliente) {
    return cliente.pedidos.length;
}

function claseEstado(estado) {
    return {
        Activo: "activo",
        Inactivo: "agotado",
        Aprobado: "activo",
        Pendiente: "bajo",
        Rechazado: "agotado"
    }[estado] || "bajo";
}

function estadoHTML(estado) {
    return `
        <span class="status ${claseEstado(estado)}">
            ${escapar(estado)}
        </span>
    `;
}

// =====================================================
// VISTA PRINCIPAL
// =====================================================

function crearVista() {
    $("#admin-contenido").innerHTML = `
        <div
            id="clientes-indicadores"
            class="kpi-grid"
        ></div>

        <section class="admin-card">

            <div class="table-toolbar">

                <input
                    id="buscar-cliente"
                    class="admin-search"
                    type="search"
                    placeholder="Buscar nombre o correo..."
                    aria-label="Buscar clientes"
                >

                <select
                    id="filtro-cliente"
                    class="admin-select"
                    aria-label="Filtrar clientes"
                >
                    <option value="">Todos los clientes</option>
                    <option value="con-compras">
                        Con compras aprobadas
                    </option>
                    <option value="sin-compras">
                        Sin compras aprobadas
                    </option>
                </select>

            </div>

            <p
                id="contador-clientes"
                class="admin-eyebrow"
            ></p>

            <div id="tabla-clientes"></div>

        </section>
    `;

    crearModal();
}

// =====================================================
// INDICADORES
// =====================================================

function renderIndicadores() {
    const conCompras = clientes.filter(
        cliente => totalGastado(cliente) > 0
    ).length;

    const sinCompras = clientes.length - conCompras;

    const ventas = clientes.reduce(
        (total, cliente) => total + totalGastado(cliente),
        0
    );

    $("#clientes-indicadores").innerHTML = `
        <article class="kpi-card">
            <small>Clientes registrados</small>
            <strong>${clientes.length}</strong>
            <span>Cuentas de demostración</span>
        </article>

        <article class="kpi-card">
            <small>Con compras</small>
            <strong>${conCompras}</strong>
            <span>Compras aprobadas</span>
        </article>

        <article class="kpi-card">
            <small>Sin compras</small>
            <strong>${sinCompras}</strong>
            <span>Sin pagos aprobados</span>
        </article>

        <article class="kpi-card">
            <small>Ventas asociadas</small>
            <strong>${CLP(ventas)}</strong>
            <span>Datos demostrativos</span>
        </article>
    `;
}

// =====================================================
// TABLA DE CLIENTES
// =====================================================

function renderTabla() {
    const busqueda = $("#buscar-cliente").value
        .trim()
        .toLocaleLowerCase("es");

    const filtro = $("#filtro-cliente").value;

    const lista = clientes.filter(cliente => {
        const texto = `${cliente.nombre} ${cliente.email}`
            .toLocaleLowerCase("es");

        const tieneCompras = totalGastado(cliente) > 0;

        const coincideFiltro =
            !filtro ||
            (filtro === "con-compras" && tieneCompras) ||
            (filtro === "sin-compras" && !tieneCompras);

        return texto.includes(busqueda) && coincideFiltro;
    });

    $("#contador-clientes").textContent =
        `${lista.length} clientes encontrados`;

    const filas = lista.map(cliente => `
        <tr>
            <td>#${cliente.id}</td>

            <td>
                <strong>${escapar(cliente.nombre)}</strong>
            </td>

            <td>${escapar(cliente.email)}</td>

            <td>${escapar(cliente.registro)}</td>

            <td>${totalPedidos(cliente)}</td>

            <td>${CLP(totalGastado(cliente))}</td>

            <td>${estadoHTML(cliente.estado)}</td>

            <td>
                <button
                    type="button"
                    class="product-action"
                    data-ver-cliente="${cliente.id}"
                >
                    Ver perfil
                </button>
            </td>
        </tr>
    `).join("");

    $("#tabla-clientes").innerHTML = `
        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Correo</th>
                        <th>Registro</th>
                        <th>Pedidos</th>
                        <th>Total gastado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas || `
                        <tr>
                            <td colspan="8">
                                No se encontraron clientes.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

// =====================================================
// MODAL DE PERFIL
// =====================================================

function crearModal() {
    if ($("#modal-cliente")) return;

    const modal = document.createElement("div");

    modal.id = "modal-cliente";
    modal.className = "product-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="product-modal-dialog cliente-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-cliente"
        >
            <div class="product-modal-header">
                <h2 id="titulo-modal-cliente">
                    Perfil del cliente
                </h2>

                <button
                    id="cerrar-modal-cliente"
                    type="button"
                    class="product-close"
                    aria-label="Cerrar perfil"
                >
                    ×
                </button>
            </div>

            <div id="contenido-perfil-cliente"></div>
        </div>
    `;

    document.body.appendChild(modal);

    $("#cerrar-modal-cliente").addEventListener(
        "click", cerrarModal
    );

    modal.addEventListener("click", evento => {
        if (evento.target === modal) cerrarModal();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !modal.hidden) {
            cerrarModal();
        }
    });
}

function abrirPerfil(id) {
    const cliente = clientes.find(c => c.id === id);

    if (!cliente) return;

    $("#titulo-modal-cliente").textContent =
        cliente.nombre;

    const filasPedidos = cliente.pedidos.map(pedido => `
        <tr>
            <td>${escapar(pedido.id)}</td>
            <td>${escapar(pedido.fecha)}</td>
            <td>${CLP(pedido.total)}</td>
            <td>${estadoHTML(pedido.estado)}</td>
        </tr>
    `).join("");

    $("#contenido-perfil-cliente").innerHTML = `
        <div class="cliente-profile-header">

            <div class="cliente-avatar">
                ${escapar(cliente.nombre.charAt(0))}
            </div>

            <div>
                <h3>${escapar(cliente.nombre)}</h3>
                <p>${escapar(cliente.email)}</p>
                ${estadoHTML(cliente.estado)}
            </div>

        </div>

        <div class="cliente-info-grid">

            <div>
                <small>Identificador</small>
                <strong>#${cliente.id}</strong>
            </div>

            <div>
                <small>Teléfono</small>
                <strong>${escapar(cliente.telefono)}</strong>
            </div>

            <div>
                <small>Fecha de registro</small>
                <strong>${escapar(cliente.registro)}</strong>
            </div>

            <div>
                <small>Pedidos realizados</small>
                <strong>${totalPedidos(cliente)}</strong>
            </div>

        </div>

        <div class="cliente-summary">
            <span>Total de compras aprobadas</span>
            <strong>${CLP(totalGastado(cliente))}</strong>
        </div>

        <h3 class="cliente-section-title">
            Historial de pedidos
        </h3>

        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Pago</th>
                    </tr>
                </thead>

                <tbody>
                    ${filasPedidos || `
                        <tr>
                            <td colspan="4">
                                Este cliente no tiene pedidos.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>

        <p class="inventory-help">
            Perfil de demostración. Los datos reales
            se consultarán desde SQLite cuando
            implementemos el backend de usuarios.
        </p>
    `;

    $("#modal-cliente").hidden = false;
    $("#cerrar-modal-cliente").focus();
}

function cerrarModal() {
    $("#modal-cliente").hidden = true;
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

export function iniciarGestionClientes() {
    if (!$("#admin-contenido")) return;

    crearVista();
    renderIndicadores();
    renderTabla();

    $("#buscar-cliente").addEventListener(
        "input", renderTabla
    );

    $("#filtro-cliente").addEventListener(
        "change", renderTabla
    );

    $("#tabla-clientes").addEventListener(
        "click", evento => {
            const boton = evento.target.closest(
                "[data-ver-cliente]"
            );

            if (!boton) return;

            abrirPerfil(Number(boton.dataset.verCliente));
        }
    );
}
