
/* ==========================================================
   ESSENZIA MATCH
   Archivo: frontend/js/match.js

   Cuestionario de recomendación de perfumes
   Compatible con match.html, match.css y perfumes.js
========================================================== */

import { perfumes } from "./data/perfumes.js";

/* ==========================================================
   1. CONFIGURACIÓN GENERAL
========================================================== */

const $ = (selector) => document.querySelector(selector);

const formatoPrecio = (precio) =>
    new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);

const nombresCategorias = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
};

const nombresFamilias = {
    floral: "Floral",
    citrica: "Cítrica",
    amaderada: "Amaderada",
    aromatica: "Aromática",
    gourmand: "Gourmand",
    acuatica: "Acuática",
    oriental: "Oriental",
    fresca: "Fresca"
};

/* ==========================================================
   2. PREGUNTAS DEL CUESTIONARIO
========================================================== */

const preguntas = [
    {
        id: "familia",
        titulo: "¿Qué tipo de aroma te atrae más?",
        descripcion:
            "Selecciona la familia olfativa que mejor representa tus gustos.",
        opciones: [
            {
                valor: "floral",
                icono: "✿",
                titulo: "Floral",
                descripcion: "Delicado, elegante y romántico"
            },
            {
                valor: "citrica",
                icono: "☀",
                titulo: "Cítrico",
                descripcion: "Fresco, luminoso y energético"
            },
            {
                valor: "amaderada",
                icono: "♣",
                titulo: "Amaderado",
                descripcion: "Profundo, sofisticado y cálido"
            },
            {
                valor: "gourmand",
                icono: "✧",
                titulo: "Dulce",
                descripcion: "Vainilla, miel y acordes deliciosos"
            },
            {
                valor: "aromatica",
                icono: "❋",
                titulo: "Aromático",
                descripcion: "Hierbas, lavanda y especias frescas"
            },
            {
                valor: "acuatica",
                icono: "≈",
                titulo: "Acuático",
                descripcion: "Ligero, limpio y refrescante"
            }
        ]
    },
    {
        id: "ocasion",
        titulo: "¿En qué ocasión usarías tu perfume?",
        descripcion:
            "Queremos encontrar una fragancia adecuada para tu estilo de vida.",
        opciones: [
            {
                valor: "diario",
                icono: "☀",
                titulo: "Todos los días",
                descripcion: "Trabajo, estudios y actividades cotidianas"
            },
            {
                valor: "formal",
                icono: "✦",
                titulo: "Ocasiones especiales",
                descripcion: "Eventos, reuniones y celebraciones"
            },
            {
                valor: "noche",
                icono: "☾",
                titulo: "Salidas nocturnas",
                descripcion: "Cenas, fiestas y encuentros"
            }
        ]
    },
    {
        id: "clima",
        titulo: "¿En qué clima lo utilizarías?",
        descripcion:
            "La temperatura puede influir en cómo percibimos una fragancia.",
        opciones: [
            {
                valor: "calido",
                icono: "☀",
                titulo: "Clima cálido",
                descripcion: "Primavera, verano y días soleados"
            },
            {
                valor: "templado",
                icono: "❀",
                titulo: "Clima templado",
                descripcion: "Temperaturas suaves"
            },
            {
                valor: "frio",
                icono: "❄",
                titulo: "Clima frío",
                descripcion: "Otoño, invierno y noches frescas"
            }
        ]
    },
    {
        id: "genero",
        titulo: "¿Qué tipo de fragancia prefieres?",
        descripcion:
            "Esta elección nos ayudará a personalizar tus resultados.",
        opciones: [
            {
                valor: "mujer",
                icono: "✿",
                titulo: "Femenina",
                descripcion: "Fragancias comercializadas para mujer"
            },
            {
                valor: "hombre",
                icono: "◆",
                titulo: "Masculina",
                descripcion: "Fragancias comercializadas para hombre"
            },
            {
                valor: "unisex",
                icono: "✧",
                titulo: "Unisex",
                descripcion: "Fragancias sin distinción de género"
            },
            {
                valor: "cualquiera",
                icono: "♡",
                titulo: "Sin preferencia",
                descripcion: "Estoy abierto a cualquier fragancia"
            }
        ]
    },
    {
        id: "categoria",
        titulo: "¿Qué colección te gustaría explorar?",
        descripcion:
            "Puedes elegir una categoría o dejar que Essenzia decida.",
        opciones: [
            {
                valor: "disenador",
                icono: "✦",
                titulo: "Diseñador",
                descripcion: "Marcas reconocidas internacionalmente"
            },
            {
                valor: "arabe",
                icono: "✧",
                titulo: "Árabe",
                descripcion: "Fragancias con carácter y personalidad"
            },
            {
                valor: "nicho",
                icono: "❖",
                titulo: "Nicho",
                descripcion: "Creaciones exclusivas y distintivas"
            },
            {
                valor: "cualquiera",
                icono: "♡",
                titulo: "Sorpréndeme",
                descripcion: "Quiero explorar todas las colecciones"
            }
        ]
    }
];

/* ==========================================================
   3. ESTADO DEL CUESTIONARIO
========================================================== */

let preguntaActual = 0;
let respuestas = {};
let resultadosActuales = [];

/* ==========================================================
   4. MOSTRAR PREGUNTAS
========================================================== */

function mostrarPregunta() {

    const contenedor = $("#match-app");

    if (!contenedor) {
        console.error("No se encontró #match-app");
        return;
    }

    const pregunta = preguntas[preguntaActual];

    const numero = preguntaActual + 1;

    const porcentaje = Math.round(
        (numero / preguntas.length) * 100
    );

    const seleccionActual = respuestas[pregunta.id];

    const opcionesHTML = pregunta.opciones
        .map((opcion) => {

            const seleccionada =
                seleccionActual === opcion.valor;

            return `
                <button
                    type="button"
                    class="match-option ${seleccionada ? "selected" : ""}"
                    data-option="${opcion.valor}"
                    aria-pressed="${seleccionada}"
                >
                    <span
                        class="match-option-icon"
                        aria-hidden="true"
                    >
                        ${opcion.icono}
                    </span>

                    <strong>${opcion.titulo}</strong>

                    <small>${opcion.descripcion}</small>
                </button>
            `;

        }).join("");

    contenedor.innerHTML = `
        <section class="match-question">

            <div class="match-progress-header">
                <span class="match-step">
                    PREGUNTA ${numero} DE ${preguntas.length}
                </span>

                <span class="match-percentage">
                    ${porcentaje}%
                </span>
            </div>

            <div
                class="match-progress"
                role="progressbar"
                aria-label="Progreso del cuestionario"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow="${porcentaje}"
            >
                <div
                    class="match-progress-fill"
                    style="width: ${porcentaje}%"
                ></div>
            </div>

            <div class="match-question-heading">
                <h2>${pregunta.titulo}</h2>
                <p>${pregunta.descripcion}</p>
            </div>

            <div
                class="match-options"
                role="group"
                aria-label="${pregunta.titulo}"
            >
                ${opcionesHTML}
            </div>

            <div class="match-actions">

                <button
                    type="button"
                    class="match-back match-btn match-btn-outline"
                    id="match-back"
                    ${preguntaActual === 0 ? "disabled" : ""}
                >
                    ← Anterior
                </button>

                <button
                    type="button"
                    class="match-next match-btn match-btn-primary"
                    id="match-next"
                    ${!seleccionActual ? "disabled" : ""}
                >
                    ${
                        numero === preguntas.length
                            ? "Ver mis resultados ✦"
                            : "Siguiente →"
                    }
                </button>

            </div>

        </section>
    `;

    configurarEventosPregunta();
}

/* ==========================================================
   5. EVENTOS DE LAS PREGUNTAS
========================================================== */

function configurarEventosPregunta() {

    const contenedor = $("#match-app");

    const pregunta = preguntas[preguntaActual];

    if (!contenedor) return;

    const opciones = contenedor.querySelectorAll(
        "[data-option]"
    );

    opciones.forEach((boton) => {

        boton.addEventListener("click", () => {

            const valor = boton.dataset.option;

            respuestas[pregunta.id] = valor;

            opciones.forEach((opcion) => {

                const seleccionada =
                    opcion.dataset.option === valor;

                opcion.classList.toggle(
                    "selected",
                    seleccionada
                );

                opcion.setAttribute(
                    "aria-pressed",
                    String(seleccionada)
                );
            });

            const botonSiguiente = $("#match-next");

            if (botonSiguiente) {
                botonSiguiente.disabled = false;
            }

        });
    });

    $("#match-back")?.addEventListener(
        "click",
        retrocederPregunta
    );

    $("#match-next")?.addEventListener(
        "click",
        avanzarPregunta
    );
}

/* ==========================================================
   6. NAVEGACIÓN
========================================================== */

function avanzarPregunta() {

    const pregunta = preguntas[preguntaActual];

    if (!respuestas[pregunta.id]) {
        return;
    }

    if (preguntaActual < preguntas.length - 1) {

        preguntaActual++;

        mostrarPregunta();

        return;
    }

    calcularResultados();
    mostrarResultados();
}

function retrocederPregunta() {

    if (preguntaActual === 0) return;

    preguntaActual--;

    mostrarPregunta();
}

/* ==========================================================
   7. ALGORITMO DE COMPATIBILIDAD

   Familia:   35 puntos
   Ocasión:   25 puntos
   Clima:     20 puntos
   Género:    10 puntos
   Categoría: 10 puntos

   TOTAL:    100 puntos
========================================================== */

function calcularCompatibilidad(perfume) {

    let puntuacion = 0;

    const razones = [];

    // Familia olfativa

    if (perfume.familia === respuestas.familia) {

        puntuacion += 35;

        razones.push(
            "Coincide con tu familia olfativa favorita"
        );
    }

    // Ocasión

    if (
        Array.isArray(perfume.ocasion) &&
        perfume.ocasion.includes(respuestas.ocasion)
    ) {

        puntuacion += 25;

        razones.push(
            "Es adecuado para la ocasión que elegiste"
        );
    }

    // Clima

    if (
        Array.isArray(perfume.clima) &&
        perfume.clima.includes(respuestas.clima)
    ) {

        puntuacion += 20;

        razones.push(
            "Se adapta al clima seleccionado"
        );
    }

    // Género

    if (respuestas.genero === "cualquiera") {

        puntuacion += 10;

    } else if (
        perfume.genero === respuestas.genero
    ) {

        puntuacion += 10;

        razones.push(
            "Coincide con tu preferencia de fragancia"
        );

    } else if (perfume.genero === "unisex") {

        puntuacion += 5;

        razones.push(
            "Es una alternativa unisex"
        );
    }

    // Categoría

    if (respuestas.categoria === "cualquiera") {

        puntuacion += 10;

    } else if (
        perfume.categoria === respuestas.categoria
    ) {

        puntuacion += 10;

        razones.push(
            "Pertenece a la colección que prefieres"
        );
    }

    return {
        ...perfume,
        compatibilidad: puntuacion,
        razones
    };
}

/* ==========================================================
   8. FILTRAR Y CALCULAR RESULTADOS

   CORRECCIÓN IMPORTANTE:
   La categoría elegida es obligatoria.

   Diseñador -> solamente diseñador
   Árabe     -> solamente árabe
   Nicho     -> solamente nicho
   Cualquiera -> todas las categorías
========================================================== */

function calcularResultados() {

    const categoriaElegida = respuestas.categoria;

    // Primero se filtra la colección seleccionada.

    const perfumesPermitidos = perfumes.filter(
        (perfume) => {

            if (categoriaElegida === "cualquiera") {
                return true;
            }

            return perfume.categoria === categoriaElegida;
        }
    );

    // Después se calcula la compatibilidad
    // exclusivamente con los perfumes permitidos.

    resultadosActuales = perfumesPermitidos
        .map(calcularCompatibilidad)
        .sort((a, b) => {

            if (
                b.compatibilidad !== a.compatibilidad
            ) {

                return (
                    b.compatibilidad -
                    a.compatibilidad
                );
            }

            return a.id - b.id;
        })
        .slice(0, 3);
}

/* ==========================================================
   9. DESCRIPCIÓN PERSONALIZADA
========================================================== */

function generarDescripcion(perfume) {

    if (!perfume.razones.length) {

        return (
            "Una alternativa de nuestra colección " +
            "que puedes explorar para descubrir " +
            "nuevas sensaciones."
        );
    }

    return perfume.razones.join(". ") + ".";
}

/* ==========================================================
   10. MOSTRAR RESULTADOS
========================================================== */

function mostrarResultados() {

    const contenedor = $("#match-app");

    const tarjeta = $("#match-card");

    if (!contenedor) return;

    // Adaptar la tarjeta para mostrar resultados.

    if (tarjeta) {

        tarjeta.style.maxWidth = "100%";
        tarjeta.style.background = "transparent";
        tarjeta.style.border = "none";
        tarjeta.style.boxShadow = "none";
        tarjeta.style.padding = "0";
    }

    // Crear tarjetas de recomendaciones.

    const tarjetasHTML = resultadosActuales
        .map((perfume, indice) => {

            const categoria =
                nombresCategorias[perfume.categoria] ||
                perfume.categoria;

            const familia =
                nombresFamilias[perfume.familia] ||
                perfume.familia;

            const imagen = perfume.imagen
                ? `../../${perfume.imagen}`
                : "";

            const etiqueta = indice === 0
                ? "✦ TU MEJOR MATCH"
                : `RECOMENDACIÓN ${indice + 1}`;

            return `
                <article class="match-result-card">

                    <div class="match-result-image">

                        <span class="match-result-position">
                            ${etiqueta}
                        </span>

                        ${
                            imagen
                                ? `
                                    <img
                                        src="${imagen}"
                                        alt="${perfume.marca} ${perfume.nombre}"
                                        loading="lazy"
                                        onerror="this.style.display='none'"
                                    >
                                `
                                : ""
                        }

                    </div>

                    <div class="match-result-info">

                        <span class="match-result-category">
                            ${categoria} · ${familia}
                        </span>

                        <p class="match-result-brand">
                            ${perfume.marca}
                        </p>

                        <h3>${perfume.nombre}</h3>

                        <div class="match-score">

                            <strong>
                                ${perfume.compatibilidad}%
                            </strong>

                            <span>de afinidad</span>

                        </div>

                        <div class="match-score-bar">
                            <div
                                style="width: ${perfume.compatibilidad}%"
                            ></div>
                        </div>

                        <p class="match-result-reason">
                            ${generarDescripcion(perfume)}
                        </p>

                        <p class="match-result-price">
                            ${formatoPrecio(perfume.precio)}
                        </p>

                        <a
                            class="match-result-button"
                            href="../catalogo/detalle.html?id=${perfume.id}"
                        >
                            Ver perfume →
                        </a>

                    </div>

                </article>
            `;

        }).join("");

    const hayResultados = resultadosActuales.length > 0;

    const mensajeResultados = hayResultados
        ? `
            Estas son las fragancias con mayor afinidad
            según tus respuestas.
        `
        : `
            No encontramos perfumes en esta colección.
            Puedes repetir el cuestionario y elegir
            otra categoría.
        `;

    contenedor.innerHTML = `
        <section class="match-results">

            <div class="match-results-heading">

                <span class="eyebrow">
                    TU SELECCIÓN PERSONALIZADA
                </span>

                <h2>
                    ${
                        hayResultados
                            ? "Encontramos tu Essenzia Match"
                            : "No encontramos coincidencias"
                    }
                </h2>

                <p>${mensajeResultados}</p>

            </div>

            <div class="match-results-grid">
                ${tarjetasHTML}
            </div>

            ${
                hayResultados
                    ? `
                        <p class="match-disclaimer">
                            Los porcentajes representan
                            coincidencias calculadas a partir
                            de tus preferencias.
                            No son mediciones científicas ni
                            predicciones de inteligencia artificial.
                        </p>
                    `
                    : ""
            }

            <div class="match-results-actions">

                <button
                    type="button"
                    class="match-restart match-btn match-btn-outline"
                    id="match-restart"
                >
                    ↻ Repetir cuestionario
                </button>

                <a
                    class="match-catalog-link match-btn match-btn-primary"
                    href="../../index.html#catalogo"
                >
                    Explorar todo el catálogo →
                </a>

            </div>

        </section>
    `;

    $("#match-restart")?.addEventListener(
        "click",
        reiniciarMatch
    );
}

/* ==========================================================
   11. REINICIAR CUESTIONARIO
========================================================== */

function reiniciarMatch() {

    preguntaActual = 0;

    respuestas = {};

    resultadosActuales = [];

    const tarjeta = $("#match-card");

    if (tarjeta) {
        tarjeta.removeAttribute("style");
    }

    mostrarPregunta();

    tarjeta?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* ==========================================================
   12. INICIALIZAR ESSENZIA MATCH
========================================================== */

function iniciarMatch() {

    const contenedor = $("#match-app");

    if (!contenedor) {

        console.error(
            "Essenzia Match: Falta #match-app en match.html."
        );

        return;
    }

    if (
        !Array.isArray(perfumes) ||
        perfumes.length === 0
    ) {

        console.error(
            "Essenzia Match: No hay perfumes disponibles."
        );

        return;
    }

    // Eliminar indicadores duplicados del HTML,
    // si existen de versiones anteriores.

    const progresoAnterior = document.querySelector(
        "#match-card > .match-step-top"
    );

    const barraAnterior = document.querySelector(
        "#match-card > #match-progress"
    );

    const botonesAnteriores = document.querySelector(
        "#match-card > .match-actions"
    );

    progresoAnterior?.remove();

    barraAnterior?.remove();

    botonesAnteriores?.remove();

    // Ocultar resultados estáticos anteriores.

    const resultadosHTML = $("#match-results");

    if (resultadosHTML) {
        resultadosHTML.hidden = true;
    }

    // Mostrar primera pregunta.

    mostrarPregunta();

    console.log(
        "Essenzia Match inicializado correctamente."
    );
}

/* ==========================================================
   13. EJECUTAR
========================================================== */

iniciarMatch();
