
/* backend/routes/pedidos-routes.js */

const express = require("express");

const {
    requerirAutenticacion,
    requerirAdministrador
} = require("./auth-routes.js");

const {
    listarPedidos,
    obtenerDetallePedido
} = require("../db/pedidos.js");

const router = express.Router();

router.use(
    requerirAutenticacion,
    requerirAdministrador
);

// Listar pedidos reales.
router.get("/", (req, res) => {
    try {
        const pedidos = listarPedidos();

        return res.json({
            total: pedidos.length,
            pedidos
        });

    } catch (error) {
        console.error("Error consultando pedidos:", error);

        return res.status(500).json({
            error: "No se pudieron consultar los pedidos."
        });
    }
});

// Consultar detalle e historial.
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Identificador de pedido inválido."
        });
    }

    try {
        const pedido = obtenerDetallePedido(id);

        if (!pedido) {
            return res.status(404).json({
                error: "Pedido no encontrado."
            });
        }

        return res.json({ pedido });

    } catch (error) {
        console.error("Error consultando pedido:", error);

        return res.status(500).json({
            error: "No se pudo consultar el pedido."
        });
    }
});

module.exports = router;
