
/* =====================================================
   ESSENZIA - WEBHOOK DE MERCADO PAGO
   Archivo: backend/routes/webhook-routes.js

   Primera etapa:
   - Recibir notificaciones
   - Validar firma
   - Validar identificador de orden
   - No modificar pagos ni inventario todavía
===================================================== */

const express = require("express");

const {
    validarWebhookMercadoPago
} = require("../utils/validar-webhook.js");

const {
    verificarOrdenMercadoPago
} = require("../services/verificar-pago.js");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        if (!process.env.MP_WEBHOOK_SECRET) {
            console.error(
                "Webhook: falta MP_WEBHOOK_SECRET."
            );

            return res.sendStatus(503);
        }

        console.log("=== DIAGNÓSTICO WEBHOOK ===");

console.log("Método:", req.method);

console.log("Query:", req.query);

console.log("Body:", req.body);

console.log(
    "Tiene x-signature:",
    Boolean(req.get("x-signature"))
);

console.log(
    "Tiene x-request-id:",
    Boolean(req.get("x-request-id"))
);

console.log(
    "Tiene secreto configurado:",
    Boolean(process.env.MP_WEBHOOK_SECRET)
);

console.log("===========================");

        const firmaValida =
            validarWebhookMercadoPago(req);

        if (!firmaValida) {
            console.warn(
                "Webhook: firma inválida o incompleta."
            );

            return res.sendStatus(401);
        }

        const orderId = req.query["data.id"];

        if (
            typeof orderId !== "string" ||
            !/^ORD[A-Z0-9]{10,80}$/i.test(orderId)
        ) {
            console.warn(
                "Webhook: identificador de orden inválido."
            );

            return res.sendStatus(400);
        }

       console.log(
    "Webhook autenticado. Orden:",
    orderId
);

const resultado = await verificarOrdenMercadoPago(
    orderId
);

console.log(
    "Webhook procesado:",
    resultado.orderId,
    resultado.estado
);

return res.sendStatus(200);

    } catch (error) {
        console.error(
            "Error procesando webhook:",
            error
        );

        return res.sendStatus(500);
    }
});

module.exports = router;
