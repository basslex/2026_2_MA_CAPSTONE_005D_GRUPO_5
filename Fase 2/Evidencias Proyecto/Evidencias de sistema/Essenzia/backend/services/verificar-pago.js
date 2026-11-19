
/* =====================================================
   ESSENZIA - VERIFICACIÓN SEGURA DE PAGOS
   Archivo: backend/services/verificar-pago.js

   Mercado Pago Orders API + Payments API
   ENTORNO: TEST
===================================================== */

const {
    obtenerPedidoPorOrden,
    actualizarEstadoPago,
    confirmarPagoYDescontarInventario
} = require("../db/pedidos.js");

const API_MP = "https://api.mercadopago.com/v1";
const MONEDA_ESPERADA = "CLP";

function crearError(mensaje, codigoHTTP = 500) {
    const error = new Error(mensaje);
    error.codigoHTTP = codigoHTTP;
    return error;
}

function importeValido(valor, esperado) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return false;
    }

    const numero = Number(valor);

    return (
        Number.isSafeInteger(numero) &&
        numero === esperado
    );
}

async function consultarMercadoPago(ruta) {
    const token = process.env.MP_ACCESS_TOKEN;

    if (!token) {
        throw crearError(
            "Falta configurar MP_ACCESS_TOKEN.",
            503
        );
    }

    let respuesta;

    try {
        respuesta = await fetch(`${API_MP}${ruta}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(15000)
        });
    } catch (error) {
        throw crearError(
            "No se pudo conectar con Mercado Pago.",
            502
        );
    }

    if (!respuesta.ok) {
        console.error(
            "Consulta Mercado Pago fallida:",
            respuesta.status
        );

        throw crearError(
            "No se pudo verificar la información en Mercado Pago.",
            502
        );
    }

    return respuesta.json();
}

function obtenerPagosOrden(orden) {
    const pagos = orden?.transactions?.payments;

    return Array.isArray(pagos) ? pagos : [];
}

function monedaOrdenCompatible(orden, pagos) {
    const monedas = [
        orden.currency_id,
        ...pagos.map(pago => pago?.currency_id)
    ].filter(moneda => moneda !== undefined && moneda !== null);

    return monedas.every(
        moneda => moneda === MONEDA_ESPERADA
    );
}

async function verificarPagosIndividuales(
    orden,
    totalEsperado
) {
    const pagosOrden = obtenerPagosOrden(orden);

    if (pagosOrden.length === 0) {
        return false;
    }

    if (!monedaOrdenCompatible(orden, pagosOrden)) {
        return false;
    }

    let totalConfirmado = 0;
    const idsConsultados = new Set();

    for (const pagoOrden of pagosOrden) {
        if (
            !pagoOrden ||
            pagoOrden.status !== "processed" ||
            pagoOrden.status_detail !== "accredited"
        ) {
            return false;
        }

        // Orders API informa el identificador del pago
        // de Payments API mediante reference_id.
        const referenciaPago = String(
            pagoOrden.reference_id ?? ""
        );

        if (
            !/^[1-9]\d*$/.test(referenciaPago) ||
            idsConsultados.has(referenciaPago)
        ) {
            return false;
        }

        idsConsultados.add(referenciaPago);

        const pago = await consultarMercadoPago(
            `/payments/${encodeURIComponent(referenciaPago)}`
        );

        // Verificar identidad del pago consultado.
        if (String(pago.id) !== referenciaPago) {
            return false;
        }

        // Verificar acreditación individual.
        if (
            pago.status !== "approved" ||
            pago.status_detail !== "accredited"
        ) {
            return false;
        }

        // Confirmar moneda desde Payments API.
        if (pago.currency_id !== MONEDA_ESPERADA) {
            return false;
        }

        const importePago = Number(
            pago.transaction_amount
        );

        if (
            !Number.isSafeInteger(importePago) ||
            importePago <= 0
        ) {
            return false;
        }

        // Comparar el importe de ambas APIs.
        if (
            !importeValido(
                pagoOrden.amount,
                importePago
            ) ||
            !importeValido(
                pagoOrden.paid_amount,
                importePago
            )
        ) {
            return false;
        }

        // Evitar errores por sumas excesivas.
        if (
            !Number.isSafeInteger(
                totalConfirmado + importePago
            )
        ) {
            return false;
        }

        totalConfirmado += importePago;
    }

    return totalConfirmado === totalEsperado;
}

async function calcularEstadoOrden(
    orden,
    totalEsperado
) {
    const estado = orden.status;
    const detalle = orden.status_detail;

    if (
        estado === "refunded" ||
        detalle === "partially_refunded"
    ) {
        return "revision";
    }

    if (
        estado === "failed" ||
        estado === "canceled"
    ) {
        return "rechazado";
    }

    if (
        estado === "created" ||
        estado === "pending" ||
        estado === "processing"
    ) {
        return "pendiente";
    }

    if (
        estado !== "processed" ||
        detalle !== "accredited"
    ) {
        return "revision";
    }

    // Validar los importes consolidados.
    if (
        !importeValido(
            orden.total_amount,
            totalEsperado
        ) ||
        !importeValido(
            orden.total_paid_amount,
            totalEsperado
        )
    ) {
        return "revision";
    }

    // Confirmar todos los pagos desde Payments API.
    const pagosVerificados =
        await verificarPagosIndividuales(
            orden,
            totalEsperado
        );

    return pagosVerificados
        ? "aprobado"
        : "revision";
}

async function verificarOrdenMercadoPago(orderId) {
    if (
        typeof orderId !== "string" ||
        !/^ORD[A-Z0-9]{10,80}$/i.test(orderId)
    ) {
        throw crearError(
            "Identificador de orden inválido.",
            400
        );
    }

    const pedido = obtenerPedidoPorOrden(orderId);

    if (!pedido) {
        throw crearError(
            "Orden no encontrada en SQLite.",
            404
        );
    }

    const orden = await consultarMercadoPago(
        `/orders/${encodeURIComponent(orderId)}`
    );

    // La orden debe pertenecer al pedido local.
    if (
        String(orden.id) !== orderId ||
        orden.external_reference !== pedido.referencia
    ) {
        throw crearError(
            "La orden no coincide con nuestros registros.",
            409
        );
    }

    const estadoCalculado =
        await calcularEstadoOrden(
            orden,
            pedido.total
        );

    let estadoGuardado;

    if (estadoCalculado === "aprobado") {
        // La función de SQLite debe garantizar
        // una transacción y descuento único.
        estadoGuardado =
            confirmarPagoYDescontarInventario(
                pedido.id
            );
    } else {
        estadoGuardado = actualizarEstadoPago(
            pedido.id,
            estadoCalculado
        );
    }

    console.log("Verificación Mercado Pago:", {
        pedidoId: pedido.id,
        orderId: String(orden.id),
        estadoMercadoPago: orden.status,
        detalleMercadoPago: orden.status_detail,
        estadoCalculado,
        estadoGuardado
    });

    return {
        pedidoId: pedido.id,
        orderId: String(orden.id),
        referencia: pedido.referencia,
        estado: estadoGuardado,
        estadoMercadoPago: orden.status,
        detalleMercadoPago: orden.status_detail,
        total: pedido.total,
        moneda: MONEDA_ESPERADA,
        monedaConfirmada:
            estadoCalculado === "aprobado"
    };
}

module.exports = {
    verificarOrdenMercadoPago
};
