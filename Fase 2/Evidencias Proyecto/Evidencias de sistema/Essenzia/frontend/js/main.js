
/* =====================================================
   ESSENZIA - ARCHIVO PRINCIPAL
   Archivo: frontend/js/main.js

   - Catálogo conectado a SQLite
   - Carrito persistente
   - Precios actualizados
   - Controles de cantidad
   - Mercado Pago Checkout Pro
   - Protección contra clics duplicados
===================================================== */

import { iniciarCatalogo } from "./catalogo.js";

// =====================================================
// 1. CONFIGURACIÓN
// =====================================================

const $ = (selector) => document.querySelector(selector);

const API_URL = "http://localhost:3000";

const CLAVE_CARRITO = "essenzia-cart";

const MAX_UNIDADES = 20;

let productosDisponibles = [];

let catalogoCargado = false;

let cargandoCatalogo = null;

let procesandoPago = false;

// =====================================================
// 2. FORMATO DE PRECIOS
// =====================================================

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
};

// =====================================================
// 3. RECUPERAR CARRITO
// =====================================================

function cargarCarrito() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_CARRITO) || "{}"
        );

        if (
            !guardado ||
            typeof guardado !== "object" ||
            Array.isArray(guardado)
        ) {
            return {};
        }

        const resultado = {};

        for (const [id, cantidad] of Object.entries(guardado)) {
            if (
                /^[1-9]\d*$/.test(id) &&
                Number.isSafeInteger(cantidad) &&
                cantidad > 0 &&
                cantidad <= MAX_UNIDADES
            ) {
                resultado[id] = cantidad;
            }
        }

        return resultado;

    } catch (error) {
        console.warn(
            "Error recuperando carrito:",
            error
        );

        return {};
    }
}

const carrito = cargarCarrito();

// =====================================================
// 4. OBTENER CATÁLOGO DESDE SQLITE
// =====================================================

async function cargarCatalogoActualizado() {
    if (cargandoCatalogo) {
        return cargandoCatalogo;
    }

    cargandoCatalogo = (async () => {
        const respuesta = await fetch(
            `${API_URL}/api/productos`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo consultar el catálogo de Essenzia."
            );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos.productos)) {
            throw new Error(
                "El servidor devolvió un catálogo inválido."
            );
        }

        productosDisponibles = datos.productos.filter(
            (producto) =>
                Number.isSafeInteger(Number(producto.id)) &&
                Number.isSafeInteger(Number(producto.precio)) &&
                Number(producto.precio) > 0 &&
                Number(producto.activo) === 1
        );

        catalogoCargado = true;

        sincronizarCarrito();

        return productosDisponibles;
    })();

    try {
        return await cargandoCatalogo;

    } finally {
        cargandoCatalogo = null;
    }
}

// =====================================================
// 5. BUSCAR PRODUCTO
// =====================================================

function obtenerProducto(id) {
    return productosDisponibles.find(
        (producto) =>
            String(producto.id) === String(id)
    );
}

// =====================================================
// 6. SINCRONIZAR CARRITO
// =====================================================

function sincronizarCarrito() {
    if (!catalogoCargado) return;

    let huboCambios = false;

    for (const id of Object.keys(carrito)) {
        if (!obtenerProducto(id)) {
            delete carrito[id];
            huboCambios = true;
        }
    }

    if (huboCambios) {
        console.info(
            "Se retiraron del carrito productos no disponibles."
        );
    }

    guardarCarrito();
}

// =====================================================
// 7. GUARDAR CARRITO
// =====================================================

function guardarCarrito() {
    try {
        localStorage.setItem(
            CLAVE_CARRITO,
            JSON.stringify(carrito)
        );

    } catch (error) {
        console.warn(
            "No se pudo guardar el carrito:",
            error
        );
    }

    actualizarContador();
}

// =====================================================
// 8. CONTADOR
// =====================================================

function actualizarContador() {
    const contador = $("#cart-count");

    if (!contador) return;

    const cantidadTotal = Object.values(carrito)
        .reduce(
            (total, cantidad) => total + cantidad,
            0
        );

    contador.textContent = cantidadTotal;
}

// =====================================================
// 9. CALCULAR TOTAL
// =====================================================

function calcularTotal() {
    return Object.entries(carrito).reduce(
        (total, [id, cantidad]) => {
            const producto = obtenerProducto(id);

            if (!producto) return total;

            return (
                total +
                Number(producto.precio) * cantidad
            );
        },
        0
    );
}

// =====================================================
// 10. MOSTRAR CARRITO
// =====================================================

async function mostrarCarrito() {
    const dialogo = $("#cart-dialog");

    const contenedor = $("#cart-items");

    const totalElemento = $("#cart-total");

    const botonPagar = $("#checkout-button");

    if (
        !dialogo ||
        !contenedor ||
        !totalElemento
    ) {
        console.warn(
            "Faltan elementos HTML del carrito."
        );

        return;
    }

    if (!dialogo.open) {
        dialogo.showModal();
    }

    contenedor.textContent =
        "Actualizando carrito...";

    totalElemento.textContent =
        "Total: —";

    if (botonPagar) {
        botonPagar.disabled = true;
    }

    try {
        await cargarCatalogoActualizado();

    } catch (error) {
        console.error(
            "Error actualizando carrito:",
            error
        );

        contenedor.textContent =
            "No se pudo consultar el catálogo. " +
            "Comprueba que el backend esté funcionando.";

        return;
    }

    const productos = Object.entries(carrito).filter(
        ([id, cantidad]) =>
            cantidad > 0 && obtenerProducto(id)
    );

    contenedor.replaceChildren();

    if (productos.length === 0) {
        const mensaje = document.createElement("p");

        mensaje.className = "cart-empty";

        mensaje.textContent =
            "Tu carrito está vacío.";

        contenedor.appendChild(mensaje);

    } else {
        for (const [id, cantidad] of productos) {
            const perfume = obtenerProducto(id);

            const fila = document.createElement("div");
            fila.className = "cart-row";

            const informacion = document.createElement("div");
            informacion.className = "cart-product-info";

            const marca = document.createElement("strong");
            marca.textContent = perfume.marca;

            const nombre = document.createElement("span");
            nombre.textContent = perfume.nombre;

            const cantidadTexto = document.createElement("small");
            cantidadTexto.textContent =
                `Cantidad: ${cantidad}`;

            informacion.append(
                marca,
                nombre,
                cantidadTexto
            );

            const acciones = document.createElement("div");
            acciones.className = "cart-product-actions";

            const precio = document.createElement("span");

            precio.textContent = formatoPrecio(
                Number(perfume.precio) * cantidad
            );

            // CONTROLES DE CANTIDAD
            const controles = document.createElement("div");

            controles.className =
                "cart-quantity-controls";

            const botonQuitar = document.createElement("button");

            botonQuitar.type = "button";
            botonQuitar.dataset.remove = id;
            botonQuitar.textContent = "−";

            botonQuitar.setAttribute(
                "aria-label",
                `Quitar una unidad de ${perfume.nombre}`
            );

            const indicador = document.createElement("span");

            indicador.className =
                "cart-quantity-value";

            indicador.textContent = cantidad;

            const botonAgregar = document.createElement("button");

            botonAgregar.type = "button";
            botonAgregar.dataset.increase = id;
            botonAgregar.textContent = "+";

            botonAgregar.disabled =
                cantidad >= MAX_UNIDADES;

            botonAgregar.setAttribute(
                "aria-label",
                `Agregar una unidad de ${perfume.nombre}`
            );

            controles.append(
                botonQuitar,
                indicador,
                botonAgregar
            );

            acciones.append(
                precio,
                controles
            );

            fila.append(
                informacion,
                acciones
            );

            contenedor.appendChild(fila);
        }
    }

    totalElemento.textContent =
        `Total: ${formatoPrecio(calcularTotal())}`;

    if (botonPagar) {
        botonPagar.disabled =
            procesandoPago ||
            productos.length === 0;
    }
}

// =====================================================
// 11. AGREGAR PRODUCTO
// =====================================================

function agregarAlCarrito(id) {
    if (!catalogoCargado) {
        console.warn(
            "El catálogo todavía no está disponible."
        );

        return false;
    }

    const producto = obtenerProducto(id);

    if (!producto) {
        alert(
            "Este producto ya no está disponible."
        );

        return false;
    }

    const cantidadActual = carrito[id] || 0;

    if (cantidadActual >= MAX_UNIDADES) {
        alert(
            `Puedes agregar como máximo ${MAX_UNIDADES} unidades.`
        );

        return false;
    }

    carrito[id] = cantidadActual + 1;

    guardarCarrito();

    return true;
}

// =====================================================
// 12. QUITAR UNA UNIDAD
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
// 13. VALIDAR URL DE MERCADO PAGO
// =====================================================

function validarUrlMercadoPago(direccion) {
    if (
        typeof direccion !== "string" ||
        !direccion.trim()
    ) {
        throw new Error(
            "Mercado Pago no devolvió una URL válida."
        );
    }

    let url;

    try {
        url = new URL(direccion);

    } catch {
        throw new Error(
            "La URL de Mercado Pago no tiene un formato válido."
        );
    }

    const dominio = url.hostname.toLowerCase();

    const dominiosPermitidos = [
        "mercadopago.cl",
        "mercadopago.com",
        "mercadopago.com.ar",
        "mercadopago.com.br",
        "mercadopago.com.co",
        "mercadopago.com.mx",
        "mercadopago.com.pe",
        "mercadopago.com.uy"
    ];

    const permitido = dominiosPermitidos.some(
        (base) =>
            dominio === base ||
            dominio.endsWith(`.${base}`)
    );

    if (
        url.protocol !== "https:" ||
        !permitido ||
        url.username ||
        url.password
    ) {
        throw new Error(
            "La URL de pago no pertenece a un dominio autorizado."
        );
    }

    console.info(
        "Mercado Pago: dominio autorizado:",
        dominio
    );

    return url;
}

// =====================================================
// 14. RESTABLECER BOTÓN DE PAGO
// =====================================================

function restablecerBotonPago() {
    procesandoPago = false;

    const boton = $("#checkout-button");

    if (!boton) return;

    boton.textContent =
        "Pagar con Mercado Pago";

    const tieneProductos = Object.values(carrito)
        .some((cantidad) => cantidad > 0);

    boton.disabled = !tieneProductos;
}

// =====================================================
// 15. PAGAR CON MERCADO PAGO
// =====================================================

async function pagarConMercadoPago(evento) {
    // Evitar acciones predeterminadas y propagación.
    if (evento) {
        evento.preventDefault();
        evento.stopPropagation();
    }

    console.info(
        "Essenzia: clic en pagar recibido."
    );

    console.info(
        "Essenzia: procesandoPago =",
        procesandoPago
    );

    if (procesandoPago) {
        console.warn(
            "Ya existe una solicitud de pago en proceso."
        );

        return;
    }

    const botonPagar = $("#checkout-button");

    procesandoPago = true;

    if (botonPagar) {
        botonPagar.disabled = true;
        botonPagar.textContent =
            "Preparando pago...";
    }

    try {
        // Consultar los precios actuales desde SQLite.
        await cargarCatalogoActualizado();

        const productos = Object.entries(carrito)
            .filter(
                ([id, cantidad]) =>
                    cantidad > 0 &&
                    obtenerProducto(id)
            )
            .map(([id, cantidad]) => ({
                id: Number(id),
                cantidad
            }));

        if (productos.length === 0) {
            throw new Error(
                "Tu carrito está vacío o sus productos " +
                "ya no están disponibles."
            );
        }

        console.info(
            "Essenzia: solicitando orden de pago.",
            { cantidadProductos: productos.length }
        );

        // Solicitar una orden al backend.
        const respuesta = await fetch(
            `${API_URL}/api/pagos/crear`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    productos
                }),

                cache: "no-store"
            }
        );

        let datos;

        try {
            datos = await respuesta.json();

        } catch {
            throw new Error(
                "El servidor devolvió una respuesta inválida."
            );
        }

        console.info(
            "Essenzia: respuesta del backend:",
            {
                codigoHTTP: respuesta.status,
                orderId: datos.orderId || null,
                tieneCheckoutUrl:
                    Boolean(datos.checkoutUrl),
                error: datos.error || null
            }
        );

        if (!respuesta.ok) {
            throw new Error(
                datos.error ||
                "No se pudo iniciar el pago."
            );
        }

        if (!datos.checkoutUrl) {
            throw new Error(
                "El servidor no devolvió una URL de pago."
            );
        }

        const urlPago = validarUrlMercadoPago(
            datos.checkoutUrl
        );

        // Guardar el identificador de la última orden.
        if (datos.orderId) {
            sessionStorage.setItem(
                "essenzia-ultima-orden",
                String(datos.orderId)
            );
        }

        console.info(
            "Essenzia: iniciando redirección a:",
            urlPago.hostname
        );

        // Navegar al checkout de Mercado Pago.
        window.location.assign(urlPago.href);

    } catch (error) {
        console.error(
            "Essenzia: error iniciando pago:",
            error
        );

        alert(
            error.message ||
            "Ocurrió un problema al conectar con Mercado Pago."
        );

        restablecerBotonPago();

        await mostrarCarrito();
    }
}

// =====================================================
// 16. MENÚ MÓVIL
// =====================================================

function configurarMenuMovil() {
    const botonMenu = $("#menu-toggle");

    const navegacion = $("#nav");

    if (!botonMenu || !navegacion) return;

    botonMenu.addEventListener(
        "click",
        () => {
            const abierto =
                navegacion.classList.toggle("open");

            botonMenu.setAttribute(
                "aria-expanded",
                String(abierto)
            );
        }
    );

    document.querySelectorAll("[data-category]")
        .forEach((enlace) => {
            enlace.addEventListener(
                "click",
                () => {
                    navegacion.classList.remove("open");

                    botonMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}

// =====================================================
// 17. BOTONES DEL CATÁLOGO
// =====================================================

function configurarBotonesCatalogo() {
    const contenedor = $("#product-grid");

    if (!contenedor) return;

    contenedor.addEventListener(
        "click",
        (evento) => {
            const boton = evento.target.closest(
                "[data-add]"
            );

            if (
                !boton ||
                !contenedor.contains(boton)
            ) {
                return;
            }

            evento.preventDefault();

            const agregado = agregarAlCarrito(
                boton.dataset.add
            );

            if (!agregado) return;

            // Confirmación visual breve.
            boton.textContent = "¡Agregado! ✓";
            boton.disabled = true;

            setTimeout(() => {
                if (boton.isConnected) {
                    boton.textContent =
                        "Agregar al carrito +";

                    boton.disabled = false;
                }
            }, 900);
        }
    );
}

// =====================================================
// 18. EVENTOS DEL CARRITO
// =====================================================

function configurarEventosCarrito() {
    const botonCarrito = $("#cart-button");

    const botonCerrar = $("#close-cart");

    const dialogo = $("#cart-dialog");

    const contenedor = $("#cart-items");

    const botonPagar = $("#checkout-button");

    if (botonCarrito) {
        botonCarrito.addEventListener(
            "click",
            (evento) => {
                evento.preventDefault();

                mostrarCarrito();
            }
        );
    }

    if (botonCerrar && dialogo) {
        botonCerrar.addEventListener(
            "click",
            (evento) => {
                evento.preventDefault();

                dialogo.close();
            }
        );
    }

    if (contenedor) {
        contenedor.addEventListener(
            "click",
            async (evento) => {
                const botonQuitar =
                    evento.target.closest(
                        "[data-remove]"
                    );

                const botonAgregar =
                    evento.target.closest(
                        "[data-increase]"
                    );

                if (botonQuitar) {
                    evento.preventDefault();

                    quitarDelCarrito(
                        botonQuitar.dataset.remove
                    );

                    await mostrarCarrito();

                    return;
                }

                if (botonAgregar) {
                    evento.preventDefault();

                    agregarAlCarrito(
                        botonAgregar.dataset.increase
                    );

                    await mostrarCarrito();
                }
            }
        );
    }

    if (botonPagar) {
        // Mantenerlo como botón normal, no de formulario.
        botonPagar.type = "button";

        botonPagar.addEventListener(
            "click",
            pagarConMercadoPago
        );

    } else {
        console.warn(
            "No se encontró #checkout-button."
        );
    }
}

// =====================================================
// 19. INICIALIZAR APLICACIÓN
// =====================================================

async function iniciarAplicacion() {
    actualizarContador();

    configurarMenuMovil();

    configurarBotonesCatalogo();

    configurarEventosCarrito();

    iniciarCatalogo();

    try {
        await cargarCatalogoActualizado();

        console.info(
            "Essenzia: carrito sincronizado con SQLite."
        );

    } catch (error) {
        console.error(
            "No se pudo sincronizar el carrito:",
            error
        );
    }
}

// =====================================================
// 20. RESTABLECER CHECKOUT AL REGRESAR
// =====================================================

window.addEventListener(
    "pageshow",
    () => {
        restablecerBotonPago();

        console.info(
            "Essenzia: checkout disponible nuevamente."
        );
    }
);

// =====================================================
// 21. DIAGNÓSTICO DE NAVEGACIÓN
// =====================================================

// Ayuda a identificar recargas inesperadas.
window.addEventListener(
    "pagehide",
    () => {
        console.info(
            "Essenzia: el navegador está saliendo de la página."
        );
    }
);

// =====================================================
// 22. EJECUTAR
// =====================================================

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacion,
        { once: true }
    );

} else {
    iniciarAplicacion();
}
