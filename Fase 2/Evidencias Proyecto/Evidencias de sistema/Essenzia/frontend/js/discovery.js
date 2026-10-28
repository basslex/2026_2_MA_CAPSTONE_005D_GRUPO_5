
/* ==========================================================
   ESSENZIA DISCOVERY BOX
   Archivo: frontend/js/discovery.js
========================================================== */

import { perfumes } from "./data/perfumes.js";

const $ = (selector) => document.querySelector(selector);

const MAX_MUESTRAS = 5;

const PRECIO_BOX = 24990;

const seleccionados = [];

const nombresCategorias = {
    disenador: "Diseñador",
    arabe: "Árabe",
    nicho: "Nicho"
};

/* ==========================================================
   MOSTRAR PERFUMES
========================================================== */

function mostrarPerfumes() {

    const contenedor = $("#discovery-perfumes");

    const categoria = $("#discovery-category").value;

    const filtrados = perfumes.filter((perfume) => {

        return (
            !categoria ||
            perfume.categoria === categoria
        );

    });

    contenedor.innerHTML = filtrados.map((perfume) => {

        const seleccionado = seleccionados.includes(
            perfume.id
        );

        const limiteAlcanzado =
            seleccionados.length >= MAX_MUESTRAS;

        return `
            <article class="discovery-perfume">

                <div class="discovery-perfume-image">

                    <img
                        src="../../${perfume.imagen}"
                        alt="${perfume.marca} ${perfume.nombre}"
                        loading="lazy"
                    >

                </div>

                <div class="discovery-perfume-info">

                    <span class="discovery-perfume-category">
                        ${
                            nombresCategorias[perfume.categoria] ||
                            perfume.categoria
                        }
                    </span>

                    <h3>${perfume.nombre}</h3>

                    <p>${perfume.marca}</p>

                    <button
                        type="button"
                        class="discovery-select ${
                            seleccionado ? "selected" : ""
                        }"
                        data-perfume="${perfume.id}"
                        ${
                            !seleccionado && limiteAlcanzado
                                ? "disabled"
                                : ""
                        }
                    >
                        ${
                            seleccionado
                                ? "✓ Seleccionado"
                                : "Agregar muestra +"
                        }
                    </button>

                </div>

            </article>
        `;

    }).join("");
}

/* ==========================================================
   SELECCIONAR O QUITAR PERFUME
========================================================== */

function cambiarSeleccion(id) {

    const indice = seleccionados.indexOf(id);

    if (indice !== -1) {

        seleccionados.splice(indice, 1);

    } else {

        if (seleccionados.length >= MAX_MUESTRAS) {
            return;
        }

        seleccionados.push(id);
    }

    mostrarPerfumes();

    actualizarResumen();
}

/* ==========================================================
   ACTUALIZAR RESUMEN
========================================================== */

function actualizarResumen() {

    const contador = $("#discovery-count");

    const contenedor = $("#discovery-selected");

    const boton = $("#discovery-add");

    contador.textContent =
        `${seleccionados.length} de ${MAX_MUESTRAS} fragancias seleccionadas`;

    const productosSeleccionados = seleccionados
        .map((id) => perfumes.find(
            (perfume) => perfume.id === id
        ))
        .filter(Boolean);

    if (!productosSeleccionados.length) {

        contenedor.innerHTML = `
            <p class="discovery-empty">
                Aún no has seleccionado muestras.
            </p>
        `;

    } else {

        contenedor.innerHTML = productosSeleccionados
            .map((perfume, indice) => {

                return `
                    <div class="discovery-selected-item">

                        <span>
                            ${indice + 1}.
                            ${perfume.nombre}
                        </span>

                        <button
                            type="button"
                            data-remove="${perfume.id}"
                            aria-label="Quitar ${perfume.nombre}"
                        >
                            ✕
                        </button>

                    </div>
                `;

            }).join("");
    }

    boton.disabled =
        seleccionados.length !== MAX_MUESTRAS;
}

/* ==========================================================
   AGREGAR DISCOVERY BOX AL CARRITO
========================================================== */

function agregarAlCarrito() {

    if (seleccionados.length !== MAX_MUESTRAS) {
        return;
    }

    let carrito = {};

    try {

        const guardado = JSON.parse(
            localStorage.getItem("essenzia-cart") || "{}"
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

    /*
       Guardamos el kit con una clave especial.
       No modificamos los productos individuales.
    */

    const clave = "discovery-box";

    carrito[clave] = (
        Number(carrito[clave]) || 0
    ) + 1;

    localStorage.setItem(
        "essenzia-cart",
        JSON.stringify(carrito)
    );

    /*
       Las muestras se almacenan por separado.
       Esto es temporal para el prototipo frontend.
    */

    localStorage.setItem(
        "essenzia-discovery-selection",
        JSON.stringify({
            muestras: [...seleccionados],
            precio: PRECIO_BOX
        })
    );

    $("#discovery-feedback").textContent =
        "¡Discovery Box agregada al carrito! ✓";

    const boton = $("#discovery-add");

    boton.textContent = "¡Agregada! ✓";

    setTimeout(() => {

        boton.textContent =
            "Agregar Discovery Box al carrito";

    }, 1500);
}

/* ==========================================================
   EVENTOS
========================================================== */

function iniciarDiscovery() {

    $("#discovery-category")?.addEventListener(
        "change",
        mostrarPerfumes
    );

    $("#discovery-perfumes")?.addEventListener(
        "click",
        (evento) => {

            const boton = evento.target.closest(
                "[data-perfume]"
            );

            if (!boton) return;

            cambiarSeleccion(
                Number(boton.dataset.perfume)
            );
        }
    );

    $("#discovery-selected")?.addEventListener(
        "click",
        (evento) => {

            const boton = evento.target.closest(
                "[data-remove]"
            );

            if (!boton) return;

            cambiarSeleccion(
                Number(boton.dataset.remove)
            );
        }
    );

    $("#discovery-add")?.addEventListener(
        "click",
        agregarAlCarrito
    );

    mostrarPerfumes();

    actualizarResumen();
}

/* ==========================================================
   INICIAR
========================================================== */

iniciarDiscovery();
