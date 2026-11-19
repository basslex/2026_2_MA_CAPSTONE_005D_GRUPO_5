
/* =====================================================
   ESSENZIA - RUTAS DE INVENTARIO
   Archivo: backend/routes/inventario-routes.js

   Funcionalidades:
   - Consultar inventario
   - Consultar historial de movimientos
   - Registrar entradas manuales
   - Registrar salidas manuales
   - Mostrar movimientos automáticos de ventas
   - Proteger operaciones administrativas
===================================================== */

const express = require("express");

const { db } = require("../db/conexion.js");

const {
    requerirAutenticacion,
    requerirAdministrador
} = require("./auth-routes.js");

const router = express.Router();

// =====================================================
// ORÍGENES AUTORIZADOS
// =====================================================

const ORIGENES_PERMITIDOS = new Set([
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]);

// =====================================================
// PROTECCIÓN DE RUTAS ADMINISTRATIVAS
// =====================================================

// Solo usuarios autenticados con rol administrador.
router.use(
    requerirAutenticacion,
    requerirAdministrador
);

// Verificar el origen de las modificaciones.
router.use((req, res, next) => {
    if (
        ["GET", "HEAD", "OPTIONS"].includes(req.method)
    ) {
        return next();
    }

    const origen = req.get("Origin");

    if (
        !origen ||
        !ORIGENES_PERMITIDOS.has(origen)
    ) {
        return res.status(403).json({
            error: "Origen no autorizado."
        });
    }

    next();
});

// =====================================================
// CONSULTAR INVENTARIO
// GET /api/admin/inventario
// =====================================================

router.get("/", (req, res) => {
    try {
        const productos = db.prepare(`
            SELECT
                id,
                nombre,
                marca,
                categoria,
                stock,
                activo
            FROM productos
            ORDER BY id ASC
        `).all();

        return res.json({
            productos: productos.map(producto => ({
                ...producto,
                activo: Boolean(producto.activo)
            }))
        });

    } catch (error) {
        console.error(
            "Error consultando inventario:",
            error
        );

        return res.status(500).json({
            error: "No se pudo consultar el inventario."
        });
    }
});

// =====================================================
// CONSULTAR HISTORIAL DE INVENTARIO
// GET /api/admin/inventario/movimientos
// =====================================================

router.get("/movimientos", (req, res) => {
    try {
        const movimientos = db.prepare(`
            SELECT
                m.id,
                m.producto_id,
                p.nombre AS producto,
                p.marca,
                m.tipo,
                m.cantidad,
                m.stock_anterior AS anterior,
                m.stock_nuevo AS nuevo,
                m.motivo,
                m.creado_en AS fecha,

                COALESCE(
                    u.nombre,
                    'Sistema / Venta online'
                ) AS responsable

            FROM movimientos_inventario m

            INNER JOIN productos p
                ON p.id = m.producto_id

            LEFT JOIN usuarios u
                ON u.id = m.usuario_id

            ORDER BY m.id DESC
            LIMIT 200
        `).all();

        return res.json({
            movimientos
        });

    } catch (error) {
        console.error(
            "Error consultando movimientos:",
            error
        );

        return res.status(500).json({
            error: "No se pudo consultar el historial."
        });
    }
});

// =====================================================
// REGISTRAR ENTRADAS Y SALIDAS MANUALES
// POST /api/admin/inventario/movimientos
// =====================================================

router.post("/movimientos", (req, res) => {
    const {
        productoId,
        tipo,
        cantidad,
        motivo
    } = req.body || {};

    // =================================================
    // VALIDAR DATOS
    // =================================================

    if (
        !Number.isSafeInteger(productoId) ||
        productoId <= 0 ||

        !["entrada", "salida"].includes(tipo) ||

        !Number.isSafeInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 10000 ||

        typeof motivo !== "string" ||
        motivo.trim().length < 3 ||
        motivo.trim().length > 250
    ) {
        return res.status(400).json({
            error: "Datos del movimiento inválidos."
        });
    }

    // =================================================
    // IDENTIFICAR ADMINISTRADOR
    // =================================================

    const usuarioId = req.usuario?.id;

    if (
        !Number.isSafeInteger(usuarioId) ||
        usuarioId <= 0
    ) {
        return res.status(401).json({
            error: "No se pudo identificar al administrador."
        });
    }

    let transaccionAbierta = false;

    try {
        // =================================================
        // INICIAR TRANSACCIÓN
        // =================================================

        db.exec("BEGIN IMMEDIATE");
        transaccionAbierta = true;

        // =================================================
        // CONSULTAR PRODUCTO
        // =================================================

        const producto = db.prepare(`
            SELECT
                id,
                nombre,
                stock
            FROM productos
            WHERE id = ?
        `).get(productoId);

        if (!producto) {
            db.exec("ROLLBACK");
            transaccionAbierta = false;

            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        const anterior = producto.stock;

        // =================================================
        // VERIFICAR EXISTENCIAS
        // =================================================

        if (
            tipo === "salida" &&
            cantidad > anterior
        ) {
            db.exec("ROLLBACK");
            transaccionAbierta = false;

            return res.status(400).json({
                error: "No hay existencias suficientes."
            });
        }

        // =================================================
        // CALCULAR NUEVO STOCK
        // =================================================

        const nuevo =
            tipo === "entrada"
                ? anterior + cantidad
                : anterior - cantidad;

        if (
            !Number.isSafeInteger(nuevo) ||
            nuevo < 0 ||
            nuevo > 2147483647
        ) {
            db.exec("ROLLBACK");
            transaccionAbierta = false;

            return res.status(400).json({
                error: "El stock resultante no es válido."
            });
        }

        // =================================================
        // ACTUALIZAR STOCK
        // =================================================

        const actualizacion = db.prepare(`
            UPDATE productos
            SET stock = ?,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id = ?
              AND stock = ?
        `).run(
            nuevo,
            productoId,
            anterior
        );

        if (actualizacion.changes !== 1) {
            throw new Error(
                "No se pudo actualizar el stock."
            );
        }

        // =================================================
        // REGISTRAR MOVIMIENTO
        // =================================================

        const resultado = db.prepare(`
            INSERT INTO movimientos_inventario (
                producto_id,
                usuario_id,
                tipo,
                cantidad,
                stock_anterior,
                stock_nuevo,
                motivo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            productoId,
            usuarioId,
            tipo,
            cantidad,
            anterior,
            nuevo,
            motivo.trim()
        );

        // =================================================
        // CONFIRMAR TRANSACCIÓN
        // =================================================

        db.exec("COMMIT");
        transaccionAbierta = false;

        return res.status(201).json({
            mensaje: "Movimiento registrado correctamente.",
            movimiento: {
                id: Number(resultado.lastInsertRowid),
                productoId,
                tipo,
                cantidad,
                anterior,
                nuevo,
                motivo: motivo.trim()
            }
        });

    } catch (error) {
        // =================================================
        // REVERTIR SI OCURRE UN ERROR
        // =================================================

        if (transaccionAbierta) {
            try {
                db.exec("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error revirtiendo transacción:",
                    rollbackError
                );
            }
        }

        console.error(
            "Error registrando movimiento:",
            error
        );

        return res.status(500).json({
            error: "No se pudo registrar el movimiento."
        });
    }
});

// =====================================================
// EXPORTAR RUTAS
// =====================================================

module.exports = router;
