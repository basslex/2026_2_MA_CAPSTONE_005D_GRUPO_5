
/* =====================================================
   ESSENZIA - ARCHIVO PRINCIPAL
   Archivo: frontend/js/main.js

   Funcionalidades:
   - Inicialización del catálogo
   - Carrito de compras
   - Guardado en localStorage
   - Contador de productos
   - Menú móvil
===================================================== */

// =====================================================
// 1. IMPORTACIONES
// =====================================================

import { perfumes } from "./data/perfumes.js";
import { iniciarCatalogo } from "./catalogo.js";

// Selector de elementos HTML
const $ = (selector) => document.querySelector(selector);

// =====================================================
// 2. FORMATO DE PRECIOS CHILENOS
// =====================================================

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
};

// =====================================================
// 3. RECUPERAR CARRITO DESDE LOCALSTORAGE
// =====================================================

function cargarCarrito() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem("essenzia-cart") || "{}"
        );

        if (
            guardado === null ||
            typeof guardado !== "object" ||
            Array.isArray(guardado)
        ) {
            return {};
        }

        const carritoValido = {};

        Object.entries(guardado).forEach(([id, cantidad]) => {
            const perfumeExiste = perfumes.some(
                (perfume) => String(perfume.id) === id
            );

            if (
                perfumeExiste &&
                Number.isInteger(cantidad) &&
                cantidad > 0
            ) {
                carritoValido[id] = cantidad;
            }
        });

        return carritoValido;

    } catch (error) {
        console.warn(
            "No se pudo recuperar el carrito:",
            error
        );

        return {};
    }
}

const carrito = cargarCarrito();

// =====================================================
// 4. GUARDAR CARRITO
// =====================================================

function guardarCarrito() {

    localStorage.setItem(
        "essenzia-cart",
        JSON.stringify(carrito)
    );

    actualizarContador();
}

// =====================================================
// 5. ACTUALIZAR CONTADOR DEL CARRITO
// =====================================================

function actualizarContador() {

    const contador = $("#cart-count");

    if (!contador) return;

    const cantidadTotal = Object.values(carrito)
        .reduce((total, cantidad) => {
            return total + cantidad;
        }, 0);

    contador.textContent = cantidadTotal;
}

// =====================================================
// 6. CALCULAR TOTAL DEL CARRITO
// =====================================================

function calcularTotal() {

    return Object.entries(carrito)
        .reduce((total, [id, cantidad]) => {

            const perfume = perfumes.find(
                (producto) => String(producto.id) === id
            );

            if (!perfume) return total;

            return total + perfume.precio * cantidad;

        }, 0);
}

// =====================================================
// 7. MOSTRAR CARRITO
// =====================================================

function mostrarCarrito() {

    const dialogo = $("#cart-dialog");
    const contenedor = $("#cart-items");
    const totalElemento = $("#cart-total");

    if (!dialogo || !contenedor || !totalElemento) {
        console.warn(
            "Faltan elementos HTML del carrito."
        );
        return;
    }

    const productos = Object.entries(carrito)
        .filter(([, cantidad]) => cantidad > 0);

    // Carrito vacío
    if (productos.length === 0) {

        contenedor.innerHTML = `
            <p class="cart-empty">
                Tu carrito está vacío.
            </p>
        `;

    } else {

        // Mostrar productos
        contenedor.innerHTML = productos.map(([id, cantidad]) => {

            const perfume = perfumes.find(
                (producto) => String(producto.id) === id
            );

            if (!perfume) return "";

            return `
                <div class="cart-row">

                    <div class="cart-product-info">
                        <strong>${perfume.marca}</strong>
                        <span>${perfume.nombre}</span>
                        <small>
                            Cantidad: ${cantidad}
                        </small>
                    </div>

                    <div class="cart-product-actions">

                        <span>
                            ${formatoPrecio(
                                perfume.precio * cantidad
                            )}
                        </span>

                        <button
                            type="button"
                            data-remove="${id}"
                            aria-label="Quitar una unidad de ${perfume.nombre}"
                        >
                            −
                        </button>

                    </div>

                </div>
            `;

        }).join("");
    }

    // Actualizar precio total
    totalElemento.textContent =
        `Total: ${formatoPrecio(calcularTotal())}`;

    // Abrir modal solamente si está cerrado
    if (!dialogo.open) {
        dialogo.showModal();
    }
}

// =====================================================
// 8. AGREGAR PERFUME AL CARRITO
// =====================================================

function agregarAlCarrito(id) {

    const perfume = perfumes.find(
        (producto) => String(producto.id) === String(id)
    );

    if (!perfume) {
        console.warn(
            "El perfume seleccionado no existe."
        );
        return false;
    }

    carrito[id] = (carrito[id] || 0) + 1;

    guardarCarrito();

    return true;
}

// =====================================================
// 9. QUITAR UNA UNIDAD DEL CARRITO
// =====================================================

function quitarDelCarrito(id) {

    if (!carrito[id]) return;

    carrito[id]--;

    if (carrito[id] <= 0) {
        delete carrito[id];
    }

    guardarCarrito();
}

// =====================================================
// 10. CONFIGURAR MENÚ MÓVIL
// =====================================================

function configurarMenuMovil() {

    const botonMenu = $("#menu-toggle");
    const navegacion = $("#nav");

    if (!botonMenu || !navegacion) return;

    botonMenu.addEventListener("click", () => {

        const abierto =
            navegacion.classList.toggle("open");

        botonMenu.setAttribute(
            "aria-expanded",
            String(abierto)
        );
    });

    // Cerrar menú al seleccionar categoría
    document.querySelectorAll("[data-category]")
        .forEach((enlace) => {

            enlace.addEventListener("click", () => {

                navegacion.classList.remove("open");

                botonMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        });
}

// =====================================================
// 11. CONFIGURAR BOTONES DEL CATÁLOGO
// =====================================================

function configurarBotonesCatalogo() {

    const contenedor = $("#product-grid");

    if (!contenedor) return;

    // Delegación de eventos:
    // funciona aunque los filtros regeneren las tarjetas
    contenedor.addEventListener("click", (evento) => {

        const boton = evento.target.closest("[data-add]");

        if (!boton || !contenedor.contains(boton)) {
            return;
        }

        const id = boton.dataset.add;

        const agregado = agregarAlCarrito(id);

        if (!agregado) return;

        // Confirmación visual
        boton.textContent = "¡Agregado! ✓";
        boton.disabled = true;

        setTimeout(() => {

            if (boton.isConnected) {
                boton.textContent = "Agregar al carrito +";
                boton.disabled = false;
            }

        }, 900);
    });
}

// =====================================================
// 12. CONFIGURAR EVENTOS DEL CARRITO
// =====================================================

function configurarEventosCarrito() {

    const botonCarrito = $("#cart-button");
    const botonCerrar = $("#close-cart");
    const dialogo = $("#cart-dialog");
    const contenedor = $("#cart-items");

    // Abrir carrito
    if (botonCarrito) {
        botonCarrito.addEventListener(
            "click",
            mostrarCarrito
        );
    }

    // Cerrar carrito
    if (botonCerrar && dialogo) {
        botonCerrar.addEventListener("click", () => {
            dialogo.close();
        });
    }

    // Quitar productos
    if (contenedor) {

        contenedor.addEventListener("click", (evento) => {

            const boton =
                evento.target.closest("[data-remove]");

            if (!boton) return;

            const id = boton.dataset.remove;

            quitarDelCarrito(id);

            // Actualizar contenido sin cerrar el modal
            mostrarCarrito();
        });
    }
}

// =====================================================
// 13. INICIALIZAR ESSENZIA
// =====================================================

function iniciarAplicacion() {

    // Inicializar contador
    actualizarContador();

    // Inicializar catálogo y filtros
    iniciarCatalogo();

    // Configurar menú móvil
    configurarMenuMovil();

    // Configurar botones de productos
    configurarBotonesCatalogo();

    // Configurar carrito
    configurarEventosCarrito();

    console.log(
        "Essenzia: catálogo y carrito inicializados."
    );
}

// Ejecutar cuando el HTML esté listo
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacion
    );

} else {

    iniciarAplicacion();
}
