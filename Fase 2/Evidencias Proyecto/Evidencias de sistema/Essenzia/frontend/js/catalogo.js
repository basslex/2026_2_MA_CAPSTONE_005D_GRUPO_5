
/* =====================================================
   ESSENZIA - CATÁLOGO DE PERFUMES
   Archivo: frontend/js/catalogo.js

   Funcionalidades:
   - Consultar productos desde SQLite mediante API
   - Mostrar únicamente productos activos
   - Actualizar precios desde el administrador
   - Buscar por nombre y marca
   - Filtrar por categoría, género y familia
   - Filtrar por ocasión y clima
   - Mostrar cantidad de resultados
   - Mantener integración con carrito de main.js
===================================================== */

const API_URL = "http://localhost:3000/api/productos";

// Productos cargados desde el backend.
let perfumes = [];

// Estado de carga.
let cargando = false;
let errorCarga = null;

// =====================================================
// 1. FORMATO DE PRECIOS
// =====================================================

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);
};

// =====================================================
// 2. NOMBRES PARA MOSTRAR EN PANTALLA
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

const nombresFamilias = {
    floral: "Floral",
    citrica: "Cítrica",
    amaderada: "Amaderada",
    aromatica: "Aromática",
    gourmand: "Gourmand",
    acuatica: "Acuática",
    oriental: "Oriental"
};

// =====================================================
// 3. FUNCIONES AUXILIARES
// =====================================================

function normalizarLista(valor) {
    if (Array.isArray(valor)) {
        return valor;
    }

    if (typeof valor === "string") {
        try {
            const convertido = JSON.parse(valor);

            if (Array.isArray(convertido)) {
                return convertido;
            }
        } catch {
            return valor
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        }
    }

    return [];
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizarProducto(producto) {
    let datosExtra = producto.datos_extra || {};

    if (typeof datosExtra === "string") {
        try {
            datosExtra = JSON.parse(datosExtra);
        } catch {
            datosExtra = {};
        }
    }

    return {
        ...datosExtra,
        ...producto,

        id: Number(producto.id),

        nombre: producto.nombre || "",
        marca: producto.marca || "",

        categoria: producto.categoria || "",
        genero: producto.genero || "",
        familia: producto.familia || "",

        precio: Number(producto.precio) || 0,

        imagen: producto.imagen || "",

        ocasion: normalizarLista(
            producto.ocasion ?? datosExtra.ocasion
        ),

        clima: normalizarLista(
            producto.clima ?? datosExtra.clima
        ),

        shade: producto.shade ??
            datosExtra.shade ??
            "#e8e3da",

        liquid: producto.liquid ??
            datosExtra.liquid ??
            "#d4af37",

        activo: producto.activo
    };
}

// =====================================================
// 4. OBTENER PRODUCTOS DESDE EL BACKEND
// =====================================================

export async function cargarProductos() {
    if (cargando) return;

    cargando = true;
    errorCarga = null;

    renderizarCatalogo();

    try {
        const respuesta = await fetch(API_URL, {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status}`
            );
        }

        const datos = await respuesta.json();

        // Compatible con distintas estructuras
        // habituales de respuesta del backend.
        const lista = Array.isArray(datos)
            ? datos
            : Array.isArray(datos.productos)
                ? datos.productos
                : null;

        if (!lista) {
            throw new Error(
                "La API no devolvió una lista de productos."
            );
        }

        perfumes = lista
            .map(normalizarProducto)
            .filter((producto) =>
                producto.activo === 1 ||
                producto.activo === true ||
                producto.activo === "1"
            );

        console.log(
            `Essenzia: ${perfumes.length} productos activos cargados.`
        );

    } catch (error) {
        console.error(
            "Error cargando catálogo:",
            error
        );

        errorCarga =
            "No pudimos cargar los perfumes. " +
            "Comprueba que el backend esté funcionando.";

        perfumes = [];

    } finally {
        cargando = false;
        renderizarCatalogo();
    }
}

// =====================================================
// 5. OBTENER FILTROS SELECCIONADOS
// =====================================================

function obtenerFiltros() {
    return {
        busqueda:
            document.querySelector("#search")
                ?.value.trim().toLowerCase() || "",

        categoria:
            document.querySelector("#category")
                ?.value || "",

        genero:
            document.querySelector("#gender")
                ?.value || "",

        familia:
            document.querySelector("#family")
                ?.value || "",

        ocasion:
            document.querySelector("#occasion")
                ?.value || "",

        clima:
            document.querySelector("#climate")
                ?.value || ""
    };
}

// =====================================================
// 6. FILTRAR PERFUMES
// =====================================================

function filtrarPerfumes(filtros) {
    return perfumes.filter((perfume) => {
        const textoBusqueda = (
            perfume.nombre + " " + perfume.marca
        ).toLowerCase();

        const coincideBusqueda =
            !filtros.busqueda ||
            textoBusqueda.includes(filtros.busqueda);

        const coincideCategoria =
            !filtros.categoria ||
            perfume.categoria === filtros.categoria;

        const coincideGenero =
            !filtros.genero ||
            perfume.genero === filtros.genero;

        const coincideFamilia =
            !filtros.familia ||
            perfume.familia === filtros.familia;

        const coincideOcasion =
            !filtros.ocasion ||
            perfume.ocasion.includes(filtros.ocasion);

        const coincideClima =
            !filtros.clima ||
            perfume.clima.includes(filtros.clima);

        return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideGenero &&
            coincideFamilia &&
            coincideOcasion &&
            coincideClima
        );
    });
}

// =====================================================
// 7. CREAR TARJETA DE PERFUME
// =====================================================

function crearTarjeta(perfume) {
    const categoria =
        nombresCategorias[perfume.categoria] ||
        perfume.categoria;

    const genero =
        nombresGeneros[perfume.genero] ||
        perfume.genero;

    const familia =
        nombresFamilias[perfume.familia] ||
        perfume.familia;

    const imagen = escaparHTML(perfume.imagen);
    const nombre = escaparHTML(perfume.nombre);
    const marca = escaparHTML(perfume.marca);

    return `
        <article class="product-card">

            <div
                class="product-art"
                style="
                    --shade:${escaparHTML(perfume.shade)};
                    --liquid:${escaparHTML(perfume.liquid)};
                "
            >
                <span class="product-badge">
                    ${escaparHTML(categoria)}
                </span>

                <img
                    class="product-image"
                    src="${imagen}"
                    alt="${marca} ${nombre}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="mini-bottle"
                    style="display:none;"
                >
                    <span>ESSENZIA</span>
                </div>

            </div>

            <div class="product-info">

                <small class="product-family">
                    ${escaparHTML(familia.toUpperCase())}
                    ·
                    ${escaparHTML(genero.toUpperCase())}
                </small>

                <p class="product-brand">
                    ${marca}
                </p>

                <h3 class="product-name">
                    ${nombre}
                </h3>

                <p class="product-price">
                    ${formatoPrecio(perfume.precio)}
                </p>

                <div class="product-actions">

                    <a
                        class="product-details"
                        href="./pages/catalogo/detalle.html?id=${perfume.id}"
                    >
                        Ver detalles
                    </a>

                    <button
                        type="button"
                        class="product-add"
                        data-add="${perfume.id}"
                    >
                        Agregar al carrito +
                    </button>

                </div>

            </div>

        </article>
    `;
}

// =====================================================
// 8. RENDERIZAR CATÁLOGO
// =====================================================

export function renderizarCatalogo() {
    const contenedor =
        document.querySelector("#product-grid");

    const contador =
        document.querySelector("#result-count");

    if (!contenedor) {
        return;
    }

    if (cargando) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>Cargando perfumes...</h3>
                <p>Estamos preparando nuestra colección.</p>
            </div>
        `;

        if (contador) {
            contador.textContent = "Cargando...";
        }

        return;
    }

    if (errorCarga) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <h3>No se pudo cargar el catálogo</h3>
                <p>${escaparHTML(errorCarga)}</p>
                <button
                    type="button"
                    id="reintentar-catalogo"
                    class="product-add"
                >
                    Reintentar
                </button>
            </div>
        `;

        if (contador) {
            contador.textContent = "Catálogo no disponible";
        }

        contenedor
            .querySelector("#reintentar-catalogo")
            ?.addEventListener(
                "click",
                cargarProductos
            );

        return;
    }

    const filtros = obtenerFiltros();

    const resultados = filtrarPerfumes(filtros);

    if (contador) {
        contador.textContent =
            `${resultados.length} de ${perfumes.length} perfumes`;
    }

    if (resultados.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">

                <h3>No encontramos perfumes</h3>

                <p>
                    Prueba cambiando los filtros
                    o buscando otra fragancia.
                </p>

            </div>
        `;

        return;
    }

    contenedor.innerHTML =
        resultados.map(crearTarjeta).join("");
}

// =====================================================
// 9. INICIALIZAR CATÁLOGO
// =====================================================

export function iniciarCatalogo() {
    const selectores = [
        "#search",
        "#category",
        "#gender",
        "#family",
        "#occasion",
        "#climate"
    ];

    selectores.forEach((selector) => {
        const elemento =
            document.querySelector(selector);

        if (elemento) {
            elemento.addEventListener(
                "input",
                renderizarCatalogo
            );
        }
    });

    // Filtrar desde las categorías de la Home.
    document
        .querySelectorAll("[data-category]")
        .forEach((enlace) => {
            enlace.addEventListener(
                "click",
                () => {
                    const generoSeleccionado =
                        enlace.dataset.category;

                    const filtroGenero =
                        document.querySelector("#gender");

                    if (filtroGenero) {
                        filtroGenero.value =
                            generoSeleccionado;

                        renderizarCatalogo();
                    }
                }
            );
        });

    // Cargar productos reales.
    cargarProductos();
}
