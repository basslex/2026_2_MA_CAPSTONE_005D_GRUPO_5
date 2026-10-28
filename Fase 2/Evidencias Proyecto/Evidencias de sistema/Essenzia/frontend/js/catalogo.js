
/* =====================================================
   ESSENZIA - CATÁLOGO DE PERFUMES
   Archivo: frontend/js/catalogo.js

   Funcionalidades:
   - Mostrar perfumes dinámicamente
   - Buscar por nombre y marca
   - Filtrar por categoría, género y familia olfativa
   - Filtrar por ocasión y clima
   - Mostrar cantidad de resultados
   - Tarjetas con precios en CLP
   - Integración con el carrito de main.js
===================================================== */

import { perfumes } from "./data/perfumes.js";

// =====================================================
// 1. FORMATO DE PRECIOS
// =====================================================

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
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
// 3. OBTENER FILTROS SELECCIONADOS
// =====================================================

function obtenerFiltros() {

    return {
        busqueda: document.querySelector("#search")
            ?.value.trim().toLowerCase() || "",

        categoria: document.querySelector("#category")
            ?.value || "",

        genero: document.querySelector("#gender")
            ?.value || "",

        familia: document.querySelector("#family")
            ?.value || "",

        ocasion: document.querySelector("#occasion")
            ?.value || "",

        clima: document.querySelector("#climate")
            ?.value || ""
    };
}

// =====================================================
// 4. FILTRAR PERFUMES
// =====================================================

function filtrarPerfumes(filtros) {

    return perfumes.filter((perfume) => {

        // Buscar por nombre o marca
        const textoBusqueda = (
            perfume.nombre + " " + perfume.marca
        ).toLowerCase();

        const coincideBusqueda =
            !filtros.busqueda ||
            textoBusqueda.includes(filtros.busqueda);

        // Categoría: Diseñador, Árabe o Nicho
        const coincideCategoria =
            !filtros.categoria ||
            perfume.categoria === filtros.categoria;

        // Género
        const coincideGenero =
            !filtros.genero ||
            perfume.genero === filtros.genero;

        // Familia olfativa
        const coincideFamilia =
            !filtros.familia ||
            perfume.familia === filtros.familia;

        // Ocasión
        const coincideOcasion =
            !filtros.ocasion ||
            perfume.ocasion.includes(filtros.ocasion);

        // Clima
        const coincideClima =
            !filtros.clima ||
            perfume.clima.includes(filtros.clima);

        // Todas las condiciones deben cumplirse
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
// 5. CREAR TARJETA DE PERFUME
// =====================================================


function crearTarjeta(perfume) {

    const categoria =
        nombresCategorias[perfume.categoria] || perfume.categoria;

    const genero =
        nombresGeneros[perfume.genero] || perfume.genero;

    const familia =
        nombresFamilias[perfume.familia] || perfume.familia;

    return `
        <article class="product-card">

            <div
                class="product-art"
                style="--shade:${perfume.shade}; --liquid:${perfume.liquid};"
            >
                <span class="product-badge">
                    ${categoria}
                </span>

                <img
                    class="product-image"
                    src="${perfume.imagen}"
                    alt="${perfume.marca} ${perfume.nombre}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div class="mini-bottle" style="display:none;">
                    <span>ESSENZIA</span>
                </div>

            </div>

            <div class="product-info">

                <small class="product-family">
                    ${familia.toUpperCase()} · ${genero.toUpperCase()}
                </small>

                <p class="product-brand">
                    ${perfume.marca}
                </p>

                <h3 class="product-name">
                    ${perfume.nombre}
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
// 6. RENDERIZAR CATÁLOGO
// =====================================================

export function renderizarCatalogo() {

    const contenedor =
        document.querySelector("#product-grid");

    const contador =
        document.querySelector("#result-count");

    // Evitar errores si no existe el contenedor
    if (!contenedor) {
        console.warn(
            "Essenzia: No se encontró #product-grid"
        );
        return;
    }

    // Obtener filtros actuales
    const filtros = obtenerFiltros();

    // Aplicar filtros
    const resultados = filtrarPerfumes(filtros);

    // Actualizar contador
    if (contador) {
        contador.textContent =
            `${resultados.length} de ${perfumes.length} perfumes`;
    }

    // Sin resultados
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

    // Mostrar productos
    contenedor.innerHTML =
        resultados.map(crearTarjeta).join("");
}

// =====================================================
// 7. INICIALIZAR FILTROS
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

    // Escuchar cambios en búsqueda y filtros
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

    // =================================================
    // 8. FILTRAR DESDE LAS CATEGORÍAS DE LA HOME
    // =================================================

    document.querySelectorAll("[data-category]")
        .forEach((enlace) => {

            enlace.addEventListener("click", () => {

                const generoSeleccionado =
                    enlace.dataset.category;

                const filtroGenero =
                    document.querySelector("#gender");

                if (filtroGenero) {

                    filtroGenero.value =
                        generoSeleccionado;

                    renderizarCatalogo();
                }
            });
        });

    // =================================================
    // 9. MOSTRAR CATÁLOGO INICIAL
    // =================================================

    renderizarCatalogo();
}
