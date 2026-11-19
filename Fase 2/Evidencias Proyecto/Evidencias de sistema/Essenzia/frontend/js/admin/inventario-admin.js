
/* =====================================================
   ESSENZIA - INVENTARIO CON SQLITE
   Archivo: frontend/js/admin/inventario-admin.js
===================================================== */

const API = "http://localhost:3000/api/admin/inventario";

const $ = selector => document.querySelector(selector);

let inventario = [];
let movimientos = [];

const categorias = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
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

function estadoStock(cantidad) {
    if (cantidad === 0) return "Agotado";
    if (cantidad <= 5) return "Bajo";
    return "Disponible";
}

function claseStock(cantidad) {
    if (cantidad === 0) return "agotado";
    if (cantidad <= 5) return "bajo";
    return "activo";
}

async function solicitarAPI(ruta = "", opciones = {}) {
    const respuesta = await fetch(`${API}${ruta}`, {
        ...opciones,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers
        },
        cache: "no-store"
    });

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.error || `Error HTTP ${respuesta.status}`
        );
    }

    return datos;
}

function crearVista() {
    const contenedor = $("#admin-contenido");
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div class="kpi-grid" id="inventario-indicadores"></div>

        <section class="admin-card">
            <div class="table-toolbar">
                <input
                    id="buscar-stock"
                    class="admin-search"
                    type="search"
                    placeholder="Buscar perfume o marca..."
                    aria-label="Buscar inventario"
                >

                <select
                    id="filtro-stock"
                    class="admin-select"
                    aria-label="Filtrar disponibilidad"
                >
                    <option value="">Todos los estados</option>
                    <option value="activo">Disponibles</option>
                    <option value="bajo">Stock bajo</option>
                    <option value="agotado">Agotados</option>
                </select>
            </div>

            <p id="contador-stock" class="admin-eyebrow"></p>
            <div id="tabla-inventario"></div>
        </section>

        <section class="admin-card">
            <h2>Historial de movimientos</h2>
            <p class="inventory-help">
                Los movimientos se guardan permanentemente
                en la base de datos SQLite.
            </p>
            <div id="historial-stock"></div>
        </section>
    `;

    crearModal();
}

function crearModal() {
    if ($("#modal-stock")) return;

    const modal = document.createElement("div");
    modal.id = "modal-stock";
    modal.className = "product-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="product-modal-dialog inventory-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-stock"
        >
            <div class="product-modal-header">
                <h2 id="titulo-modal-stock">
                    Ajustar inventario
                </h2>

                <button
                    id="cerrar-modal-stock"
                    type="button"
                    class="product-close"
                    aria-label="Cerrar"
                >×</button>
            </div>

            <form id="form-stock">
                <input type="hidden" id="stock-producto-id">

                <div class="inventory-product-info">
                    <strong id="stock-producto-nombre"></strong>
                    <span id="stock-producto-marca"></span>
                    <p>
                        Existencias actuales:
                        <strong id="stock-actual"></strong>
                    </p>
                </div>

                <div class="product-form-grid">
                    <div class="product-field">
                        <label for="stock-operacion">
                            Tipo de movimiento
                        </label>

                        <select id="stock-operacion" required>
                            <option value="entrada">
                                Entrada de productos
                            </option>
                            <option value="salida">
                                Salida de productos
                            </option>
                        </select>
                    </div>

                    <div class="product-field">
                        <label for="stock-cantidad">
                            Cantidad
                        </label>

                        <input
                            id="stock-cantidad"
                            type="number"
                            min="1"
                            max="10000"
                            step="1"
                            required
                        >
                    </div>

                    <div class="product-field full">
                        <label for="stock-motivo">
                            Motivo del movimiento
                        </label>

                        <textarea
                            id="stock-motivo"
                            rows="3"
                            maxlength="250"
                            placeholder="Ejemplo: reposición de proveedor"
                            required
                        ></textarea>
                    </div>
                </div>

                <p
                    id="stock-resultado"
                    class="product-feedback"
                    role="status"
                    aria-live="polite"
                ></p>

                <div class="product-modal-actions">
                    <button
                        id="cancelar-stock"
                        type="button"
                        class="admin-button secondary"
                    >
                        Cancelar
                    </button>

                    <button type="submit" class="admin-button">
                        Guardar movimiento
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    $("#cerrar-modal-stock").addEventListener(
        "click", cerrarModal
    );

    $("#cancelar-stock").addEventListener(
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

    $("#form-stock").addEventListener(
        "submit", guardarMovimiento
    );
}

function abrirModal(id) {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    $("#form-stock").reset();
    $("#stock-producto-id").value = producto.id;
    $("#stock-producto-nombre").textContent = producto.nombre;
    $("#stock-producto-marca").textContent = producto.marca;
    $("#stock-actual").textContent = producto.stock;
    $("#stock-resultado").textContent = "";

    $("#modal-stock").hidden = false;
    $("#stock-cantidad").focus();
}

function cerrarModal() {
    const modal = $("#modal-stock");
    if (modal) modal.hidden = true;
}

async function cargarInventario() {
    const datos = await solicitarAPI();
    inventario = datos.productos || [];
}

async function cargarMovimientos() {
    const datos = await solicitarAPI("/movimientos");
    movimientos = datos.movimientos || [];
}

async function actualizarDatos() {
    try {
        await Promise.all([
            cargarInventario(),
            cargarMovimientos()
        ]);

        actualizarVista();

    } catch (error) {
        console.error("Error cargando inventario:", error);

        $("#tabla-inventario").textContent =
            `No se pudo cargar el inventario: ${error.message}`;

        $("#historial-stock").textContent =
            "No se pudo cargar el historial.";
    }
}

async function guardarMovimiento(evento) {
    evento.preventDefault();

    const productoId = Number($("#stock-producto-id").value);
    const tipo = $("#stock-operacion").value;
    const cantidad = Number($("#stock-cantidad").value);
    const motivo = $("#stock-motivo").value.trim();

    const producto = inventario.find(p => p.id === productoId);
    const mensaje = $("#stock-resultado");

    if (!producto) {
        mensaje.textContent = "Producto no encontrado.";
        return;
    }

    if (
        !Number.isSafeInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 10000
    ) {
        mensaje.textContent = "Ingresa una cantidad válida.";
        return;
    }

    if (!["entrada", "salida"].includes(tipo)) {
        mensaje.textContent = "Selecciona un movimiento válido.";
        return;
    }

    if (motivo.length < 3 || motivo.length > 250) {
        mensaje.textContent =
            "El motivo debe tener entre 3 y 250 caracteres.";
        return;
    }

    if (tipo === "salida" && cantidad > producto.stock) {
        mensaje.textContent =
            "No puedes retirar más unidades de las disponibles.";
        return;
    }

    const boton = $("#form-stock button[type='submit']");
    boton.disabled = true;
    mensaje.textContent = "Guardando movimiento...";

    try {
        await solicitarAPI("/movimientos", {
            method: "POST",
            body: JSON.stringify({
                productoId,
                tipo,
                cantidad,
                motivo
            })
        });

        cerrarModal();
        await actualizarDatos();

    } catch (error) {
        mensaje.textContent = error.message;
    } finally {
        boton.disabled = false;
    }
}

function renderIndicadores() {
    const unidades = inventario.reduce(
        (suma, p) => suma + Number(p.stock), 0
    );

    const bajos = inventario.filter(
        p => p.stock > 0 && p.stock <= 5
    ).length;

    const agotados = inventario.filter(
        p => p.stock === 0
    ).length;

    $("#inventario-indicadores").innerHTML = `
        <article class="kpi-card">
            <small>Productos</small>
            <strong>${inventario.length}</strong>
            <span>Referencias del catálogo</span>
        </article>

        <article class="kpi-card">
            <small>Unidades disponibles</small>
            <strong>${unidades}</strong>
            <span>Stock registrado en SQLite</span>
        </article>

        <article class="kpi-card">
            <small>Stock bajo</small>
            <strong>${bajos}</strong>
            <span>5 unidades o menos</span>
        </article>

        <article class="kpi-card">
            <small>Agotados</small>
            <strong>${agotados}</strong>
            <span>Sin existencias</span>
        </article>
    `;
}

function renderTabla() {
    const busqueda = $("#buscar-stock").value
        .trim().toLocaleLowerCase("es");

    const filtro = $("#filtro-stock").value;

    const lista = inventario.filter(producto => {
        const texto = `${producto.nombre} ${producto.marca}`
            .toLocaleLowerCase("es");

        return texto.includes(busqueda) &&
            (!filtro || claseStock(producto.stock) === filtro);
    });

    $("#contador-stock").textContent =
        `${lista.length} productos encontrados`;

    const filas = lista.map(producto => `
        <tr>
            <td>#${producto.id}</td>
            <td>
                <strong>${escapar(producto.nombre)}</strong>
                <div>${escapar(producto.marca)}</div>
            </td>
            <td>
                ${escapar(
                    categorias[producto.categoria] ||
                    producto.categoria
                )}
            </td>
            <td>${producto.stock}</td>
            <td>
                <span class="status ${claseStock(producto.stock)}">
                    ${estadoStock(producto.stock)}
                </span>
            </td>
            <td>
                <button
                    class="product-action"
                    type="button"
                    data-ajustar-stock="${producto.id}"
                >
                    Ajustar stock
                </button>
            </td>
        </tr>
    `).join("");

    $("#tabla-inventario").innerHTML = `
        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Unidades</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas || `
                        <tr>
                            <td colspan="6">
                                No hay productos para mostrar.
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const normalizada = String(fecha).replace(
        " ", "T"
    );

    const fechaLocal = new Date(`${normalizada}Z`);

    if (Number.isNaN(fechaLocal.getTime())) {
        return String(fecha);
    }

    return fechaLocal.toLocaleString("es-CL");
}

function renderHistorial() {
    if (!movimientos.length) {
        $("#historial-stock").innerHTML = `
            <p class="inventory-help">
                Todavía no se han registrado movimientos.
            </p>
        `;
        return;
    }

    const filas = movimientos.map(m => `
        <tr>
            <td>${escapar(formatearFecha(m.fecha))}</td>
            <td>${escapar(m.producto)}</td>
            <td>${m.tipo === "entrada" ? "Entrada" : "Salida"}</td>
            <td>${m.cantidad}</td>
            <td>${m.anterior} → ${m.nuevo}</td>
            <td>${escapar(m.motivo)}</td>
        </tr>
    `).join("");

    $("#historial-stock").innerHTML = `
        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Movimiento</th>
                        <th>Cantidad</th>
                        <th>Stock anterior / nuevo</th>
                        <th>Motivo</th>
                    </tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
    `;
}

function actualizarVista() {
    renderIndicadores();
    renderTabla();
    renderHistorial();
}

export function iniciarGestionInventario() {
    if (!$("#admin-contenido")) return;

    crearVista();

    $("#buscar-stock").addEventListener(
        "input", renderTabla
    );

    $("#filtro-stock").addEventListener(
        "change", renderTabla
    );

    $("#tabla-inventario").addEventListener(
        "click", evento => {
            const boton = evento.target.closest(
                "[data-ajustar-stock]"
            );

            if (!boton) return;

            abrirModal(Number(boton.dataset.ajustarStock));
        }
    );

    $("#tabla-inventario").textContent =
        "Cargando inventario desde SQLite...";

    actualizarDatos();
}
