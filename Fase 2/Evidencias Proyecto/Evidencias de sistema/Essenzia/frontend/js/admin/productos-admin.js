
/* ==============================================
   ESSENZIA - GESTIÓN DE PRODUCTOS
   Archivo: frontend/js/admin/productos-admin.js

   PROTOTIPO:
   Los cambios no modifican perfumes.js ni SQLite.
============================================== */



const $ = (selector) => document.querySelector(selector);

const formatoCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

const categorias = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
};

const generos = {
    hombre: "Hombre",
    mujer: "Mujer",
    unisex: "Unisex"
};

const API_PRODUCTOS = "http://localhost:3000/api/admin/productos";

const estado = {
    productos: [],
    editandoId: null,
    cargando: false
};

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}


async function solicitarAPI(ruta = "", opciones = {}) {
    const respuesta = await fetch(
        `${API_PRODUCTOS}${ruta}`,
        {
            ...opciones,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...opciones.headers
            }
        }
    );

    let datos = {};

    try {
        datos = await respuesta.json();
    } catch {
        throw new Error("El servidor devolvió una respuesta inválida.");
    }

    if (!respuesta.ok) {
        throw new Error(
            datos.error || `Error HTTP ${respuesta.status}`
        );
    }

    return datos;
}

async function cargarProductos() {
    const tabla = $("#tabla-productos");

    if (tabla) {
        tabla.textContent = "Cargando productos desde SQLite...";
    }

    try {
        const datos = await solicitarAPI();

        estado.productos = datos.productos || [];
        renderTablaProductos();
    } catch (error) {
        console.error(error);

        if (tabla) {
            tabla.textContent =
                `No se pudieron cargar los productos: ${error.message}`;
        }
    }
}


function imagenProducto(ruta) {
    if (!ruta) return "";

    // Solo se admiten rutas relativas del catálogo.
    const rutaLimpia = String(ruta).trim();

    if (
        !/^img\/perfumes\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i
            .test(rutaLimpia)
    ) {
        return "";
    }

    return `../../${rutaLimpia}`;
}

function crearModal() {
    const modal = document.createElement("div");

    modal.id = "modal-producto";
    modal.className = "product-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="product-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-producto"
        >
            <div class="product-modal-header">
                <h2 id="titulo-modal-producto">
                    Nuevo perfume
                </h2>

                <button
                    type="button"
                    class="product-close"
                    id="cerrar-modal-producto"
                    aria-label="Cerrar formulario"
                >
                    ×
                </button>
            </div>

            <form id="form-producto">
                <div class="product-form-grid">

                    <div class="product-field">
                        <label for="producto-nombre">
                            Nombre del perfume
                        </label>

                        <input
                            id="producto-nombre"
                            name="nombre"
                            required
                            maxlength="120"
                        >
                    </div>

                    <div class="product-field">
                        <label for="producto-marca">
                            Marca
                        </label>

                        <input
                            id="producto-marca"
                            name="marca"
                            required
                            maxlength="80"
                        >
                    </div>

                    <div class="product-field">
                        <label for="producto-categoria">
                            Categoría
                        </label>

                        <select
                            id="producto-categoria"
                            name="categoria"
                            required
                        >
                            <option value="disenador">Diseñador</option>
                            <option value="arabe">Árabe</option>
                            <option value="nicho">Nicho</option>
                        </select>
                    </div>

                    <div class="product-field">
                        <label for="producto-genero">
                            Género
                        </label>

                        <select
                            id="producto-genero"
                            name="genero"
                            required
                        >
                            <option value="hombre">Hombre</option>
                            <option value="mujer">Mujer</option>
                            <option value="unisex">Unisex</option>
                        </select>
                    </div>

                    <div class="product-field">
                        <label for="producto-precio">
                            Precio (CLP)
                        </label>

                        <input
                            id="producto-precio"
                            name="precio"
                            type="number"
                            min="1"
                            max="99999999"
                            step="1"
                            required
                        >
                    </div>

                    <div class="product-field">
                        <label for="producto-familia">
                            Familia olfativa
                        </label>

                        <select
                            id="producto-familia"
                            name="familia"
                        >
                            <option value="aromatica">Aromática</option>
                            <option value="amaderada">Amaderada</option>
                            <option value="floral">Floral</option>
                            <option value="gourmand">Gourmand</option>
                            <option value="citrica">Cítrica</option>
                            <option value="acuatica">Acuática</option>
                        </select>
                    </div>

                    <div class="product-field full">
                        <label for="producto-imagen">
                            Ruta de imagen
                        </label>

                        <input
                            id="producto-imagen"
                            name="imagen"
                            placeholder="img/perfumes/nuevo-perfume.jpg"
                        >

                        <small>
                            Utiliza una imagen existente dentro
                            de frontend/img/perfumes/.
                        </small>
                    </div>

                    <div class="product-field full">
                        <label for="producto-descripcion">
                            Descripción
                        </label>

                        <textarea
                            id="producto-descripcion"
                            name="descripcion"
                            rows="3"
                            maxlength="500"
                            placeholder="Describe la fragancia..."
                        ></textarea>
                    </div>
                </div>

                <div class="product-preview">
                    <img
                        id="preview-imagen"
                        alt="Vista previa del perfume"
                        hidden
                    >

                    <div>
                        <strong id="preview-nombre">
                            Nuevo perfume
                        </strong>

                        <small id="preview-marca">
                            Marca
                        </small>

                        <strong id="preview-precio">
                            $0
                        </strong>
                    </div>
                </div>

                <p
                    class="product-feedback"
                    id="mensaje-producto"
                    role="status"
                    aria-live="polite"
                ></p>

                <div class="product-modal-actions">
                    <button
                        type="button"
                        class="admin-button secondary"
                        id="cancelar-producto"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        class="admin-button"
                    >
                        Guardar producto
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    $("#cerrar-modal-producto").addEventListener(
        "click", cerrarModal
    );

    $("#cancelar-producto").addEventListener(
        "click", cerrarModal
    );

    modal.addEventListener("click", e => {
        if (e.target === modal) cerrarModal();
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !modal.hidden) {
            cerrarModal();
        }
    });

    $("#form-producto").addEventListener(
        "input", actualizarPreview
    );

    $("#form-producto").addEventListener(
        "change", actualizarPreview
    );

    $("#form-producto").addEventListener(
        "submit", guardarProducto
    );

    $("#preview-imagen").addEventListener("error", () => {
        $("#preview-imagen").hidden = true;
    });
}

function abrirModal(id = null) {
    estado.editandoId = id;

    const formulario = $("#form-producto");
    formulario.reset();

    const producto = estado.productos.find(p => p.id === id);

    $("#titulo-modal-producto").textContent =
        producto ? "Editar perfume" : "Nuevo perfume";

    if (producto) {
        for (const campo of [
            "nombre",
            "marca",
            "categoria",
            "genero",
            "precio",
            "familia",
            "imagen",
            "descripcion"
        ]) {
            const elemento = formulario.elements.namedItem(campo);

            if (elemento) {
                elemento.value = producto[campo] ?? "";
            }
        }
    }

    $("#mensaje-producto").textContent = "";
    $("#modal-producto").hidden = false;

    actualizarPreview();
    $("#producto-nombre").focus();
}

function cerrarModal() {
    $("#modal-producto").hidden = true;
    estado.editandoId = null;
}

function actualizarPreview() {
    const nombre = $("#producto-nombre").value.trim();
    const marca = $("#producto-marca").value.trim();
    const precio = Number($("#producto-precio").value);
    const ruta = imagenProducto($("#producto-imagen").value);

    $("#preview-nombre").textContent = nombre || "Nuevo perfume";
    $("#preview-marca").textContent = marca || "Marca";

    $("#preview-precio").textContent =
        formatoCLP.format(Number.isFinite(precio) ? precio : 0);

    const imagen = $("#preview-imagen");

    imagen.hidden = true;
    imagen.removeAttribute("src");

    if (ruta) {
        imagen.src = ruta;
        imagen.hidden = false;
    }
}


async function guardarProducto(evento) {
    evento.preventDefault();

    const formulario = $("#form-producto");

    if (!formulario.reportValidity()) return;

    const datos = Object.fromEntries(
        new FormData(formulario).entries()
    );

    const precio = Number(datos.precio);

    if (
        !Number.isSafeInteger(precio) ||
        precio < 1 ||
        precio > 99999999
    ) {
        $("#mensaje-producto").textContent =
            "Ingresa un precio válido en pesos chilenos.";
        return;
    }

    const rutaImagen = datos.imagen.trim();

    if (rutaImagen && !imagenProducto(rutaImagen)) {
        $("#mensaje-producto").textContent =
            "La imagen debe usar una ruta válida: " +
            "img/perfumes/archivo.jpg";
        return;
    }

    const datosProducto = {
        nombre: datos.nombre.trim(),
        marca: datos.marca.trim(),
        categoria: datos.categoria,
        genero: datos.genero,
        precio,
        familia: datos.familia,
        imagen: rutaImagen,
        descripcion: datos.descripcion.trim()
    };

    const boton = formulario.querySelector(
        'button[type="submit"]'
    );

    boton.disabled = true;
    $("#mensaje-producto").textContent =
        "Guardando producto...";

    try {
        const editando = estado.editandoId !== null;

        await solicitarAPI(
            editando ? `/${estado.editandoId}` : "",
            {
                method: editando ? "PUT" : "POST",
                body: JSON.stringify(datosProducto)
            }
        );

        cerrarModal();
        await cargarProductos();

    } catch (error) {
        $("#mensaje-producto").textContent =
            error.message;
    } finally {
        boton.disabled = false;
    }
}



async function eliminarProducto(id) {
    const producto = estado.productos.find(
        p => p.id === id
    );

    if (!producto) return;

    const nuevoEstado = !producto.activo;

    const accion = nuevoEstado
        ? "reactivar"
        : "desactivar";

    const confirmado = window.confirm(
        `¿Deseas ${accion} "${producto.nombre}"?`
    );

    if (!confirmado) return;

    try {
        await solicitarAPI(`/${id}/estado`, {
            method: "PATCH",
            body: JSON.stringify({
                activo: nuevoEstado
            })
        });

        await cargarProductos();
    } catch (error) {
        window.alert(error.message);
    }
}


function renderTablaProductos() {
    const busqueda = ($("#buscar-producto")?.value || "")
        .toLocaleLowerCase("es")
        .trim();

    const categoria = $("#filtro-categoria")?.value || "";

    const lista = estado.productos.filter(p => {
        const texto = `${p.marca} ${p.nombre}`
            .toLocaleLowerCase("es");

        return (
            texto.includes(busqueda) &&
            (!categoria || p.categoria === categoria)
        );
    });

    const contador = $("#contador-productos");

    if (contador) {
        contador.textContent =
            `${lista.length} productos encontrados`;
    }

    const filas = lista.map(p => `
        <tr>
            <td>#${p.id}</td>

            <td>
                <strong>${escapar(p.marca)}</strong>
                <div>${escapar(p.nombre)}</div>
            </td>

            <td>${escapar(categorias[p.categoria] || p.categoria)}</td>
            <td>${escapar(generos[p.genero] || p.genero)}</td>
            <td>${formatoCLP.format(p.precio)}</td>

            <td>
               <span class="status ${p.activo ? "activo" : "inactivo"}">
    ${p.activo ? "Activo" : "Inactivo"}
</span>
            </td>

            <td>
                <div class="product-actions">
                    <button
                        type="button"
                        class="product-action"
                        data-editar="${p.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="product-action danger"
                        data-eliminar="${p.id}"
                    >
                        ${p.activo ? "Desactivar" : "Reactivar"}
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    const tabla = $("#tabla-productos");

    if (!tabla) return;

    tabla.innerHTML = `
        <div class="table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Género</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${filas || `
                        <tr>
                            <td colspan="7">
                                <div class="empty-message">
                                    No hay productos para mostrar.
                                </div>
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

export function iniciarGestionProductos() {
    if (!$("#tabla-productos")) return;

    crearModal();

    const botonNuevo = document.querySelector(
        "#nuevo-producto"
    );

    if (botonNuevo) {
        botonNuevo.disabled = false;
        botonNuevo.removeAttribute("title");

        botonNuevo.addEventListener("click", () => {
            abrirModal();
        });
    }

    $("#tabla-productos").addEventListener("click", e => {
        const editar = e.target.closest("[data-editar]");
        const eliminar = e.target.closest("[data-eliminar]");

        if (editar) {
            abrirModal(Number(editar.dataset.editar));
        }

        if (eliminar) {
            eliminarProducto(Number(eliminar.dataset.eliminar));
        }
    });

    $("#buscar-producto").addEventListener(
        "input", renderTablaProductos
    );

    $("#filtro-categoria").addEventListener(
        "change", renderTablaProductos
    );

    cargarProductos();
}
