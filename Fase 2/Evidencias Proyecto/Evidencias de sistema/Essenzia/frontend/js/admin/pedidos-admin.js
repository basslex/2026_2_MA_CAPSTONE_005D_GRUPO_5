
/* =====================================================
   ESSENZIA - GESTIÓN DE PEDIDOS
   Archivo: frontend/js/admin/pedidos-admin.js

   PROTOTIPO:
   - Pedidos demostrativos
   - Detalle de cada compra
   - Búsqueda y filtros
   - Gestión de preparación y despacho
   - Historial de cambios
   - Sin modificar estados de pago reales
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
// PEDIDOS DE DEMOSTRACIÓN
// =====================================================

const pedidos = [
    {
        id: "ESS-001",
        fecha: "2026-11-05",
        cliente: "Cliente de ejemplo 1",
        email: "cliente1@example.com",
        pago: "Aprobado",
        preparacion: "Pendiente",
        productos: [
            {
                nombre: "Sauvage Eau de Parfum",
                marca: "Dior",
                cantidad: 1,
                precio: 119990
            }
        ],
        historial: [
            {
                fecha: "2026-11-05",
                descripcion: "Pedido registrado (demo)"
            }
        ]
    },
    {
        id: "ESS-002",
        fecha: "2026-11-06",
        cliente: "Cliente de ejemplo 2",
        email: "cliente2@example.com",
        pago: "Pendiente",
        preparacion: "Pendiente",
        productos: [
            {
                nombre: "Khamrah",
                marca: "Lattafa",
                cantidad: 1,
                precio: 49990
            }
        ],
        historial: [
            {
                fecha: "2026-11-06",
                descripcion: "Pedido registrado (demo)"
            }
        ]
    },
    {
        id: "ESS-003",
        fecha: "2026-11-07",
        cliente: "Cliente de ejemplo 3",
        email: "cliente3@example.com",
        pago: "Rechazado",
        preparacion: "Pendiente",
        productos: [
            {
                nombre: "Perfume de demostración",
                marca: "Essenzia",
                cantidad: 1,
                precio: 89990
            }
        ],
        historial: [
            {
                fecha: "2026-11-07",
                descripcion: "Pedido registrado (demo)"
            }
        ]
    },
    {
        id: "ESS-004",
        fecha: "2026-11-08",
        cliente: "Cliente de ejemplo 4",
        email: "cliente4@example.com",
        pago: "Aprobado",
        preparacion: "Preparando",
        productos: [
            {
                nombre: "Aventus",
                marca: "Creed",
                cantidad: 1,
                precio: 329990
            }
        ],
        historial: [
            {
                fecha: "2026-11-08",
                descripcion: "Pedido registrado (demo)"
            },
            {
                fecha: "2026-11-09",
                descripcion: "Preparación iniciada (demo)"
            }
        ]
    }
];

// =====================================================
// FUNCIONES DE PEDIDOS
// =====================================================

function totalPedido(pedido) {
    return pedido.productos.reduce(
        (total, producto) =>
            total + producto.precio * producto.cantidad,
        0
    );
}

function clasePago(estado) {
    return {
        Aprobado: "activo",
        Pendiente: "bajo",
        Rechazado: "agotado"
    }[estado] || "bajo";
}

function clasePreparacion(estado) {
    return {
        Pendiente: "bajo",
        Preparando: "activo",
        Enviado: "activo",
        Entregado: "activo"
    }[estado] || "bajo";
}

function estadoHTML(estado, clase) {
    return `
        <span class="status ${clase}">
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
            id="pedidos-indicadores"
            class="kpi-grid"
        ></div>

        <section class="admin-card">

            <div class="table-toolbar">

                <input
                    id="buscar-pedido"
                    class="admin-search"
                    type="search"
                    placeholder="Buscar pedido o cliente..."
                    aria-label="Buscar pedidos"
                >

                <select
                    id="filtro-pago"
                    class="admin-select"
                    aria-label="Filtrar por pago"
                >
                    <option value="">Todos los pagos</option>
                    <option value="Aprobado">Aprobados</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Rechazado">Rechazados</option>
                </select>

                <select
                    id="filtro-preparacion"
                    class="admin-select"
                    aria-label="Filtrar por preparación"
                >
                    <option value="">Todos los envíos</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Preparando">Preparando</option>
                    <option value="Enviado">Enviados</option>
                    <option value="Entregado">Entregados</option>
                </select>

            </div>

            <p
                id="contador-pedidos"
                class="admin-eyebrow"
            ></p>

            <div id="tabla-pedidos"></div>

        </section>
    `;

    crearModal();
}

// =====================================================
// INDICADORES
// =====================================================

function renderIndicadores() {
    const aprobados = pedidos.filter(
        p => p.pago === "Aprobado"
    ).length;

    const pendientes = pedidos.filter(
        p => p.pago === "Pendiente"
    ).length;

    const rechazados = pedidos.filter(
        p => p.pago === "Rechazado"
    ).length;

    $("#pedidos-indicadores").innerHTML = `
        <article class="kpi-card">
            <small>Total de pedidos</small>
            <strong>${pedidos.length}</strong>
            <span>Pedidos de demostración</span>
        </article>

        <article class="kpi-card">
            <small>Aprobados</small>
            <strong>${aprobados}</strong>
            <span>Pagos simulados</span>
        </article>

        <article class="kpi-card">
            <small>Pendientes</small>
            <strong>${pendientes}</strong>
            <span>Esperando confirmación</span>
        </article>

        <article class="kpi-card">
            <small>Rechazados</small>
            <strong>${rechazados}</strong>
            <span>Pagos simulados</span>
        </article>
    `;
}

// =====================================================
// TABLA DE PEDIDOS
// =====================================================

function renderTabla() {
    const busqueda = $("#buscar-pedido").value
        .trim()
        .toLocaleLowerCase("es");

    const filtroPago = $("#filtro-pago").value;
    const filtroPreparacion = $("#filtro-preparacion").value;

    const lista = pedidos.filter(pedido => {
        const texto = `
            ${pedido.id}
            ${pedido.cliente}
            ${pedido.email}
        `.toLocaleLowerCase("es");

        return texto.includes(busqueda) &&
            (!filtroPago || pedido.pago === filtroPago) &&
            (
                !filtroPreparacion ||
                pedido.preparacion === filtroPreparacion
            );
    });

    $("#contador-pedidos").textContent =
        `${lista.length} pedidos encontrados`;

    const filas = lista.map(pedido => `
        <tr>
            <td>
                <strong>${escapar(pedido.id)}</strong>
            </td>

            <td>${escapar(pedido.fecha)}</td>

            <td>
                <strong>${escapar(pedido.cliente)}</strong>
                <div>${escapar(pedido.email)}</div>
            </td>

            <td>${CLP(totalPedido(pedido))}</td>

            <td>
                ${estadoHTML(pedido.pago, clasePago(pedido.pago))}
            </td>

            <td>
                ${estadoHTML(
                    pedido.preparacion,
                    clasePreparacion(pedido.preparacion)
                )}
            </td>

            <td>
                <button
                    type="button"
                    class="product-action"
                    data-ver-pedido="${escapar(pedido.id)}"
                >
                    Ver detalle
                </button>
            </td>
        </tr>
    `).join("");

    $("#tabla-pedidos").innerHTML = `
        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Pago</th>
                        <th>Preparación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas || `
                        <tr>
                            <td colspan="7">
                                No se encontraron pedidos.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

// =====================================================
// MODAL DE DETALLE
// =====================================================

function crearModal() {
    if ($("#modal-pedido")) return;

    const modal = document.createElement("div");

    modal.id = "modal-pedido";
    modal.className = "product-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="product-modal-dialog pedido-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-pedido"
        >
            <div class="product-modal-header">
                <h2 id="titulo-modal-pedido">
                    Detalle del pedido
                </h2>

                <button
                    id="cerrar-modal-pedido"
                    type="button"
                    class="product-close"
                    aria-label="Cerrar detalle"
                >
                    ×
                </button>
            </div>

            <div id="contenido-detalle-pedido"></div>
        </div>
    `;

    document.body.appendChild(modal);

    $("#cerrar-modal-pedido").addEventListener(
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

    $("#contenido-detalle-pedido").addEventListener(
        "click", evento => {
            if (evento.target.id === "guardar-preparacion") {
                guardarPreparacion();
            }
        }
    );
}

function abrirDetalle(id) {
    const pedido = pedidos.find(p => p.id === id);

    if (!pedido) return;

    $("#titulo-modal-pedido").textContent =
        `Pedido ${pedido.id}`;

    const filasProductos = pedido.productos.map(producto => `
        <tr>
            <td>
                <strong>${escapar(producto.nombre)}</strong>
                <div>${escapar(producto.marca)}</div>
            </td>
            <td>${producto.cantidad}</td>
            <td>${CLP(producto.precio)}</td>
            <td>${CLP(producto.precio * producto.cantidad)}</td>
        </tr>
    `).join("");

    const historial = pedido.historial.map(movimiento => `
        <div class="pedido-history-item">
            <small>${escapar(movimiento.fecha)}</small>
            <p>${escapar(movimiento.descripcion)}</p>
        </div>
    `).join("");

    const puedePreparar = pedido.pago === "Aprobado";

    $("#contenido-detalle-pedido").innerHTML = `
        <div class="pedido-info-grid">
            <div>
                <small>Cliente</small>
                <strong>${escapar(pedido.cliente)}</strong>
                <span>${escapar(pedido.email)}</span>
            </div>

            <div>
                <small>Fecha</small>
                <strong>${escapar(pedido.fecha)}</strong>
            </div>

            <div>
                <small>Estado del pago</small>
                ${estadoHTML(pedido.pago, clasePago(pedido.pago))}
            </div>

            <div>
                <small>Estado de preparación</small>
                ${estadoHTML(
                    pedido.preparacion,
                    clasePreparacion(pedido.preparacion)
                )}
            </div>
        </div>

        <h3 class="pedido-section-title">
            Productos comprados
        </h3>

        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>

                <tbody>${filasProductos}</tbody>
            </table>
        </div>

        <div class="pedido-total">
            <span>Total del pedido</span>
            <strong>${CLP(totalPedido(pedido))}</strong>
        </div>

        <h3 class="pedido-section-title">
            Gestión de preparación
        </h3>

        ${
            puedePreparar
                ? `
                    <div class="pedido-preparacion">
                        <select
                            id="nuevo-estado-preparacion"
                            class="admin-select"
                            aria-label="Nuevo estado de preparación"
                        >
                            ${[
                                "Pendiente",
                                "Preparando",
                                "Enviado",
                                "Entregado"
                            ].map(estado => `
                                <option
                                    value="${estado}"
                                    ${
                                        pedido.preparacion === estado
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    ${estado}
                                </option>
                            `).join("")}
                        </select>

                        <button
                            type="button"
                            class="admin-button"
                            id="guardar-preparacion"
                            data-pedido="${escapar(pedido.id)}"
                        >
                            Guardar estado
                        </button>
                    </div>
                `
                : `
                    <p class="pedido-warning">
                        No se puede gestionar la preparación
                        mientras el pago no esté aprobado.
                    </p>
                `
        }

        <h3 class="pedido-section-title">
            Historial del pedido
        </h3>

        <div class="pedido-history">
            ${historial}
        </div>

        <p class="inventory-help">
            Esta información es demostrativa.
            Los cambios no afectan pedidos ni pagos reales.
        </p>
    `;

    $("#modal-pedido").hidden = false;
    $("#cerrar-modal-pedido").focus();
}

function cerrarModal() {
    $("#modal-pedido").hidden = true;
}

function guardarPreparacion() {
    const boton = $("#guardar-preparacion");

    if (!boton) return;

    const id = boton.dataset.pedido;
    const pedido = pedidos.find(p => p.id === id);

    if (!pedido || pedido.pago !== "Aprobado") return;

    const nuevoEstado = $("#nuevo-estado-preparacion").value;

    const estados = [
        "Pendiente",
        "Preparando",
        "Enviado",
        "Entregado"
    ];

    if (!estados.includes(nuevoEstado)) return;

    if (nuevoEstado === pedido.preparacion) {
        return;
    }

    const anterior = pedido.preparacion;

    pedido.preparacion = nuevoEstado;

    pedido.historial.unshift({
        fecha: new Date().toLocaleString("es-CL"),
        descripcion:
            `Preparación: ${anterior} → ${nuevoEstado}`
    });

    renderTabla();
    abrirDetalle(id);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

export function iniciarGestionPedidos() {
    if (!$("#admin-contenido")) return;

    crearVista();
    renderIndicadores();
    renderTabla();

    $("#buscar-pedido").addEventListener(
        "input", renderTabla
    );

    $("#filtro-pago").addEventListener(
        "change", renderTabla
    );

    $("#filtro-preparacion").addEventListener(
        "change", renderTabla
    );

    $("#tabla-pedidos").addEventListener(
        "click", evento => {
            const boton = evento.target.closest(
                "[data-ver-pedido]"
            );

            if (!boton) return;

            abrirDetalle(boton.dataset.verPedido);
        }
    );
}
