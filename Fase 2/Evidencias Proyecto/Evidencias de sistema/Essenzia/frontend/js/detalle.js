
/* ==========================================
   ESSENZIA - DETALLE DE PERFUME
   Archivo: frontend/js/detalle.js

   Funcionalidades:
   - Información dinámica del perfume
   - Carrito de compras
   - Pirámide olfativa interactiva
   - Simulación temporal de notas
   - Controles iniciar / pausar / reiniciar
   - Barra de progreso
========================================== */

import { perfumes } from "./data/perfumes.js";

/* ==========================================
   CONFIGURACIÓN GENERAL
========================================== */

const $ = (selector) => document.querySelector(selector);

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
};

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

const familias = {
    floral: "Floral",
    amaderada: "Amaderada",
    aromatica: "Aromática",
    gourmand: "Gourmand",
    citrica: "Cítrica",
    acuatica: "Acuática",
    oriental: "Oriental",
    fresca: "Fresca"
};

const descripciones = {
    salida:
        "Las notas de salida son los primeros aromas que percibes al aplicar el perfume. Suelen ser ligeras y volátiles.",

    corazon:
        "Las notas de corazón aparecen cuando las notas iniciales comienzan a disminuir. Representan el carácter central de la fragancia.",

    fondo:
        "Las notas de fondo aportan profundidad y permanencia. Son los aromas que suelen permanecer durante más tiempo."
};

/* ==========================================
   OBTENER PERFUME DESDE LA URL
========================================== */

const parametros = new URLSearchParams(
    window.location.search
);

const id = Number(parametros.get("id"));

const perfume = perfumes.find(
    (producto) => producto.id === id
);

const contenedor = $("#product-detail");

/* ==========================================
   CONFIGURACIÓN DE LA EXPERIENCIA

   Cada etapa dura 8 segundos.
   Total: 24 segundos.

   Es una simulación educativa,
   no una medición real de duración.
========================================== */

const DURACION_ETAPA = 8000;

const etapas = [
    {
        id: "salida",
        titulo: "Notas de salida",
        nombre: "Salida"
    },
    {
        id: "corazon",
        titulo: "Notas de corazón",
        nombre: "Corazón"
    },
    {
        id: "fondo",
        titulo: "Notas de fondo",
        nombre: "Fondo"
    }
];

const DURACION_TOTAL =
    DURACION_ETAPA * etapas.length;

const INTERVALO_ACTUALIZACION = 50;

/* ==========================================
   ESTADO DE LA SIMULACIÓN
========================================== */

let tiempoTranscurrido = 0;

let intervaloExperiencia = null;

let experienciaActiva = false;

let experienciaPausada = false;

let experienciaCompletada = false;

let ultimaActualizacion = 0;

let nivelSeleccionado = "salida";

/* ==========================================
   FUNCIONES AUXILIARES
========================================== */

function obtenerTexto(diccionario, clave) {
    return diccionario[clave] || clave || "No especificado";
}

function capitalizar(texto) {
    if (!texto) return "";

    return texto.charAt(0).toUpperCase() +
        texto.slice(1);
}

function formatearLista(valores) {
    if (!Array.isArray(valores)) {
        return "No especificado";
    }

    return valores.map(capitalizar).join(", ");
}

function obtenerNotas(nivel) {
    const notas = perfume?.notas?.[nivel];

    return Array.isArray(notas) ? notas : [];
}

/* ==========================================
   MOSTRAR DETALLE DEL PERFUME
========================================== */

function mostrarDetalle() {

    if (!contenedor) {
        console.error(
            "Essenzia: No se encontró #product-detail"
        );
        return;
    }

    if (!perfume) {

        contenedor.innerHTML = `
            <div class="sin-resultados">

                <h2>Perfume no encontrado</h2>

                <p>
                    No encontramos el producto solicitado.
                </p>

                <a
                    class="button"
                    href="../../index.html#catalogo"
                >
                    Volver al catálogo
                </a>

            </div>
        `;

        return;
    }

    document.title =
        `${perfume.nombre} | Essenzia`;

    const categoria = obtenerTexto(
        categorias,
        perfume.categoria
    );

    const genero = obtenerTexto(
        generos,
        perfume.genero
    );

    const familia = obtenerTexto(
        familias,
        perfume.familia
    );

    contenedor.innerHTML = `
        <div class="detail-layout">

            <!-- IMAGEN DEL PERFUME -->
            <div class="detail-photo">

                <img
                    src="../../${perfume.imagen}"
                    alt="${perfume.marca} ${perfume.nombre}"
                    id="detail-image"
                >

            </div>

            <!-- INFORMACIÓN -->
            <div class="detail-info">

                <span class="detail-category">
                    ${categoria}
                </span>

                <p class="detail-brand">
                    ${perfume.marca}
                </p>

                <h1 class="detail-name">
                    ${perfume.nombre}
                </h1>

                <p class="detail-price">
                    ${formatoPrecio(perfume.precio)}
                </p>

                <p class="detail-description">
                    Descubre una fragancia de la familia
                    ${familia.toLowerCase()},
                    seleccionada por Essenzia para
                    acompañarte en distintas ocasiones.
                    Explora sus notas olfativas y encuentra
                    el aroma que mejor conecta contigo.
                </p>

                <!-- CARACTERÍSTICAS -->
                <div class="detail-meta">

                    <p>
                        <strong>Género:</strong>
                        ${genero}
                    </p>

                    <p>
                        <strong>Familia olfativa:</strong>
                        ${familia}
                    </p>

                    <p>
                        <strong>Ocasiones:</strong>
                        ${formatearLista(perfume.ocasion)}
                    </p>

                    <p>
                        <strong>Climas:</strong>
                        ${formatearLista(perfume.clima)}
                    </p>

                </div>

                <!-- AGREGAR AL CARRITO -->
                <button
                    type="button"
                    class="detail-add"
                    id="detail-add"
                >
                    Agregar al carrito +
                </button>

            </div>

        </div>
    `;

    const botonCarrito = $("#detail-add");

    if (botonCarrito) {
        botonCarrito.addEventListener(
            "click",
            agregarAlCarrito
        );
    }

    mostrarPiramide();

    configurarExperiencia();
}

/* ==========================================
   MOSTRAR PIRÁMIDE OLFATIVA
========================================== */

function mostrarPiramide() {

    const seccion = $("#olfactory-section");

    const piramide = $("#olfactory-pyramid");

    if (!seccion || !piramide) return;

    seccion.hidden = false;

    piramide.innerHTML = etapas.map((etapa) => {

        const notas = obtenerNotas(etapa.id);

        const textoNotas = notas.length
            ? notas.join(" · ")
            : "Notas no disponibles";

        return `
            <button
                type="button"
                class="note-level"
                data-level="${etapa.id}"
                aria-pressed="false"
            >

                <h3>${etapa.titulo}</h3>

                <p>${textoNotas}</p>

            </button>
        `;

    }).join("");

    /* SELECCIÓN MANUAL DE NOTAS */

    piramide.addEventListener(
        "click",
        (evento) => {

            const boton = evento.target.closest(
                "[data-level]"
            );

            if (!boton) return;

            const nivel = boton.dataset.level;

            seleccionarNivel(nivel);

        }
    );

    seleccionarNivel("salida");
}

/* ==========================================
   SELECCIONAR NIVEL OLFATIVO
========================================== */

function seleccionarNivel(nivel) {

    if (!etapas.some((etapa) => etapa.id === nivel)) {
        return;
    }

    nivelSeleccionado = nivel;

    document.querySelectorAll(
        ".note-level"
    ).forEach((boton) => {

        const activo =
            boton.dataset.level === nivel;

        boton.classList.toggle(
            "active",
            activo
        );

        boton.setAttribute(
            "aria-pressed",
            String(activo)
        );

    });

    const notas = obtenerNotas(nivel);

    const explicacion = $("#note-explanation");

    if (!explicacion) return;

    const textoNotas = notas.length
        ? notas.join(" · ")
        : "Notas no disponibles";

    explicacion.innerHTML = `
        <strong>
            ${textoNotas}
        </strong>

        <p>
            ${descripciones[nivel]}
        </p>
    `;
}

/* ==========================================
   CONFIGURAR EXPERIENCIA INTERACTIVA
========================================== */

function configurarExperiencia() {

    const botonIniciar = $("#experience-start");

    const botonPausar = $("#experience-pause");

    const botonReiniciar = $("#experience-reset");

    if (
        !botonIniciar ||
        !botonPausar ||
        !botonReiniciar
    ) {

        console.warn(
            "Essenzia: No se encontraron los controles de experiencia."
        );

        return;
    }

    botonIniciar.addEventListener(
        "click",
        iniciarExperiencia
    );

    botonPausar.addEventListener(
        "click",
        pausarExperiencia
    );

    botonReiniciar.addEventListener(
        "click",
        reiniciarExperiencia
    );

    actualizarProgreso();

    actualizarBotones();

    mostrarEstado(
        "Selecciona una etapa o inicia la experiencia."
    );
}

/* ==========================================
   OBTENER ETAPA ACTUAL
========================================== */

function obtenerIndiceEtapa() {

    if (tiempoTranscurrido >= DURACION_TOTAL) {
        return etapas.length - 1;
    }

    return Math.min(
        Math.floor(
            tiempoTranscurrido / DURACION_ETAPA
        ),
        etapas.length - 1
    );
}

/* ==========================================
   ACTUALIZAR BARRA DE PROGRESO
========================================== */

function actualizarProgreso() {

    const porcentaje = Math.min(
        100,
        Math.max(
            0,
            (tiempoTranscurrido / DURACION_TOTAL) * 100
        )
    );

    const barra = $("#experience-progress-fill");

    const contenedorBarra = $("#experience-progress");

    const indicadorPorcentaje =
        $("#experience-percent");

    const contador = $("#experience-counter");

    if (barra) {
        barra.style.width = `${porcentaje}%`;
    }

    if (contenedorBarra) {
        contenedorBarra.setAttribute(
            "aria-valuenow",
            String(Math.round(porcentaje))
        );
    }

    if (indicadorPorcentaje) {
        indicadorPorcentaje.textContent =
            `${Math.round(porcentaje)}%`;
    }

    const indiceEtapa = obtenerIndiceEtapa();

    if (contador) {
        contador.textContent =
            `Etapa ${indiceEtapa + 1} de ${etapas.length}`;
    }

    /* ACTUALIZAR INDICADORES VISUALES */

    const indicadores = document.querySelectorAll(
        ".experience-stages > span"
    );

    indicadores.forEach((indicador, indice) => {

        indicador.classList.toggle(
            "active",
            indice === indiceEtapa
        );

        indicador.classList.toggle(
            "completed",
            indice < indiceEtapa ||
            experienciaCompletada
        );

    });

    return porcentaje;
}

/* ==========================================
   ACTUALIZAR BOTONES
========================================== */

function actualizarBotones() {

    const botonIniciar = $("#experience-start");

    const botonPausar = $("#experience-pause");

    const botonReiniciar = $("#experience-reset");

    if (
        !botonIniciar ||
        !botonPausar ||
        !botonReiniciar
    ) return;

    /* BOTÓN INICIAR */

    if (experienciaActiva) {

        botonIniciar.disabled = true;

        botonIniciar.innerHTML = `
            <span aria-hidden="true">▶</span>
            En reproducción
        `;

    } else if (experienciaPausada) {

        botonIniciar.disabled = false;

        botonIniciar.innerHTML = `
            <span aria-hidden="true">▶</span>
            Continuar
        `;

    } else if (experienciaCompletada) {

        botonIniciar.disabled = false;

        botonIniciar.innerHTML = `
            <span aria-hidden="true">↻</span>
            Repetir experiencia
        `;

    } else {

        botonIniciar.disabled = false;

        botonIniciar.innerHTML = `
            <span aria-hidden="true">▶</span>
            Iniciar experiencia
        `;
    }

    /* BOTÓN PAUSAR */

    botonPausar.disabled = !experienciaActiva;

    /* BOTÓN REINICIAR */

    botonReiniciar.disabled =
        !experienciaActiva &&
        !experienciaPausada &&
        !experienciaCompletada &&
        tiempoTranscurrido === 0;
}

/* ==========================================
   MOSTRAR MENSAJE DE ESTADO
========================================== */

function mostrarEstado(mensaje) {

    const estado = $("#experience-status");

    if (estado) {
        estado.textContent = mensaje;
    }
}

/* ==========================================
   DETENER TEMPORIZADOR
========================================== */

function detenerTemporizador() {

    if (intervaloExperiencia !== null) {

        clearInterval(intervaloExperiencia);

        intervaloExperiencia = null;
    }
}

/* ==========================================
   INICIAR / CONTINUAR EXPERIENCIA
========================================== */

function iniciarExperiencia() {

    if (!perfume) return;

    if (experienciaActiva) return;

    /* SI TERMINÓ, VOLVER A EMPEZAR */

    if (experienciaCompletada) {

        tiempoTranscurrido = 0;

        experienciaCompletada = false;

        seleccionarNivel("salida");
    }

    experienciaActiva = true;

    experienciaPausada = false;

    ultimaActualizacion = performance.now();

    actualizarBotones();

    actualizarProgreso();

    const indiceInicial = obtenerIndiceEtapa();

    seleccionarNivel(
        etapas[indiceInicial].id
    );

    mostrarEstado(
        `Reproduciendo ${etapas[indiceInicial].titulo.toLowerCase()}.`
    );

    detenerTemporizador();

    intervaloExperiencia = setInterval(() => {

        const ahora = performance.now();

        const diferencia =
            ahora - ultimaActualizacion;

        ultimaActualizacion = ahora;

        tiempoTranscurrido = Math.min(
            DURACION_TOTAL,
            tiempoTranscurrido + diferencia
        );

        const indiceEtapa = obtenerIndiceEtapa();

        const etapaActual = etapas[indiceEtapa];

        /* CAMBIAR ETAPA AUTOMÁTICAMENTE */

        if (nivelSeleccionado !== etapaActual.id) {

            seleccionarNivel(
                etapaActual.id
            );

            mostrarEstado(
                `Explorando ${etapaActual.titulo.toLowerCase()}: ${obtenerNotas(etapaActual.id).join(" · ")}.`
            );
        }

        actualizarProgreso();

        /* FINALIZAR EXPERIENCIA */

        if (
            tiempoTranscurrido >= DURACION_TOTAL
        ) {

            completarExperiencia();
        }

    }, INTERVALO_ACTUALIZACION);
}

/* ==========================================
   PAUSAR EXPERIENCIA
========================================== */

function pausarExperiencia() {

    if (!experienciaActiva) return;

    detenerTemporizador();

    experienciaActiva = false;

    experienciaPausada = true;

    actualizarBotones();

    mostrarEstado(
        "Experiencia pausada. Presiona Continuar para seguir explorando."
    );
}

/* ==========================================
   REINICIAR EXPERIENCIA
========================================== */

function reiniciarExperiencia() {

    detenerTemporizador();

    tiempoTranscurrido = 0;

    experienciaActiva = false;

    experienciaPausada = false;

    experienciaCompletada = false;

    seleccionarNivel("salida");

    actualizarProgreso();

    actualizarBotones();

    mostrarEstado(
        "Experiencia reiniciada. Presiona Iniciar experiencia para comenzar."
    );
}

/* ==========================================
   COMPLETAR EXPERIENCIA
========================================== */

function completarExperiencia() {

    detenerTemporizador();

    tiempoTranscurrido = DURACION_TOTAL;

    experienciaActiva = false;

    experienciaPausada = false;

    experienciaCompletada = true;

    seleccionarNivel("fondo");

    actualizarProgreso();

    actualizarBotones();

    mostrarEstado(
        "Experiencia completada. Has descubierto las tres etapas de la fragancia."
    );
}

/* ==========================================
   AGREGAR PRODUCTO AL CARRITO
========================================== */

function agregarAlCarrito() {

    if (!perfume) return;

    let carrito = {};

    try {

        const guardado = JSON.parse(
            localStorage.getItem(
                "essenzia-cart"
            ) || "{}"
        );

        if (
            guardado &&
            typeof guardado === "object" &&
            !Array.isArray(guardado)
        ) {
            carrito = guardado;
        }

    } catch (error) {

        console.warn(
            "No se pudo recuperar el carrito:",
            error
        );
    }

    const idProducto = String(perfume.id);

    const cantidadActual = Number(
        carrito[idProducto]
    );

    carrito[idProducto] =
        (
            Number.isInteger(cantidadActual) &&
            cantidadActual > 0
                ? cantidadActual
                : 0
        ) + 1;

    localStorage.setItem(
        "essenzia-cart",
        JSON.stringify(carrito)
    );

    const boton = $("#detail-add");

    if (!boton) return;

    boton.textContent =
        "¡Agregado al carrito! ✓";

    boton.disabled = true;

    setTimeout(() => {

        if (!boton.isConnected) return;

        boton.textContent =
            "Agregar al carrito +";

        boton.disabled = false;

    }, 1200);
}

/* ==========================================
   LIMPIEZA AL SALIR DE LA PÁGINA
========================================== */

window.addEventListener(
    "pagehide",
    detenerTemporizador
);

/* ==========================================
   INICIALIZAR PÁGINA
========================================== */

mostrarDetalle();

console.log(
    "Essenzia: detalle y experiencia olfativa inicializados."
);
