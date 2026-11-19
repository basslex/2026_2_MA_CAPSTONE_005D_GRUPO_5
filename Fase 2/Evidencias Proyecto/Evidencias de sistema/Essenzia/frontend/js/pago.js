
/* ==============================================
   ESSENZIA - RESULTADOS DE PAGO
   Archivo: frontend/js/pago.js
============================================== */

const API_URL = "http://localhost:3000";

const $ = (selector) => document.querySelector(selector);

const formatoPrecio = (precio) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(precio);
};

// ==============================================
// 1. OBTENER IDENTIFICADOR DE LA ORDEN
// ==============================================

function obtenerOrderId() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const idUrl = parametros.get("order_id");

    if (idUrl) {
        return idUrl;
    }

    return sessionStorage.getItem(
        "essenzia-ultima-orden"
    );
}

// ==============================================
// 2. ACTUALIZAR INTERFAZ
// ==============================================

function mostrarMensaje(titulo, descripcion, tipo) {
    const tituloElemento = $("#pago-titulo");
    const descripcionElemento = $("#pago-descripcion");
    const icono = $("#pago-icono");

    if (tituloElemento) {
        tituloElemento.textContent = titulo;
    }

    if (descripcionElemento) {
        descripcionElemento.textContent = descripcion;
    }

    if (icono) {
        icono.className = `pago-icono ${tipo}`;

        if (tipo === "exitoso") {
            icono.textContent = "✓";
        } else if (tipo === "rechazado") {
            icono.textContent = "✕";
        } else {
            icono.textContent = "⌛";
        }
    }
}

function mostrarDetalles(datos) {
    const detalles = $("#pago-detalles");

    if (!detalles) {
        return;
    }

    detalles.hidden = false;

    $("#pago-orden").textContent = datos.orderId;
    $("#pago-total").textContent = formatoPrecio(
        datos.total
    );

    $("#pago-referencia").textContent =
        datos.referencia || "No disponible";

    $("#pago-estado-real").textContent =
        datos.estadoMercadoPago || "Sin información";
}

// ==============================================
// 3. INTERPRETAR RESULTADO VERIFICADO
// ==============================================

function procesarResultado(datos) {
    const estado = datos.estado;

    mostrarDetalles(datos);

    if (estado === "aprobado") {
        mostrarMensaje(
            "¡Tu pago fue aprobado!",
            "Mercado Pago confirmó la acreditación " +
            "de tu compra. Gracias por elegir Essenzia.",
            "exitoso"
        );

        $("#pago-estado").textContent =
            "Pago verificado correctamente con Mercado Pago.";

        return;
    }

    if (estado === "rechazado") {
        mostrarMensaje(
            "No se pudo completar el pago",
            "Mercado Pago informó que la operación " +
            "fue rechazada o cancelada.",
            "rechazado"
        );

        $("#pago-estado").textContent =
            "Puedes regresar a Essenzia e intentar nuevamente.";

        return;
    }

    if (estado === "revision") {
        mostrarMensaje(
            "Tu compra requiere revisión",
            "La operación necesita una verificación adicional. " +
            "No se ha confirmado la compra.",
            "pendiente"
        );

        $("#pago-estado").textContent =
            "No realices otro pago hasta revisar el estado.";

        return;
    }

    mostrarMensaje(
        "Estamos verificando tu pago",
        "Tu operación todavía no aparece acreditada. " +
        "Puedes volver a consultar su estado.",
        "pendiente"
    );

    $("#pago-estado").textContent =
        "Estado actual: pendiente de confirmación.";
}

// ==============================================
// 4. CONSULTAR BACKEND
// ==============================================

async function consultarPago() {
    const estadoElemento = $("#pago-estado");
    const boton = $("#consultar-pago");
    const orderId = obtenerOrderId();

    if (!orderId) {
        mostrarMensaje(
            "No encontramos una compra para verificar",
            "Primero debes iniciar una compra desde " +
            "el carrito de Essenzia.",
            "pendiente"
        );

        estadoElemento.textContent =
            "No hay un identificador de orden disponible.";

        return;
    }

    try {
        if (boton) {
            boton.disabled = true;
            boton.textContent = "Consultando...";
        }

        estadoElemento.textContent =
            "Consultando el estado con Mercado Pago...";

        const respuesta = await fetch(
            `${API_URL}/api/pagos/orden/${encodeURIComponent(orderId)}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.error || "No se pudo verificar el pago."
            );
        }

        procesarResultado(datos);

    } catch (error) {
        console.error(
            "Error verificando pago:",
            error
        );

        mostrarMensaje(
            "No pudimos verificar tu compra",
            "No es posible confirmar el resultado " +
            "del pago en este momento.",
            "pendiente"
        );

        estadoElemento.textContent = error.message;
        estadoElemento.classList.add("pago-error");

    } finally {
        if (boton) {
            boton.disabled = false;
            boton.textContent = "Consultar nuevamente";
        }
    }
}

// ==============================================
// 5. INICIAR PÁGINA
// ==============================================

function iniciarPaginaPago() {
    const boton = $("#consultar-pago");

    if (boton) {
        boton.addEventListener(
            "click",
            consultarPago
        );
    }

    consultarPago();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarPaginaPago
    );
} else {
    iniciarPaginaPago();
}
