
/* =====================================================
   ESSENZIA - GESTIÓN DE PEDIDOS
   Archivo: backend/db/pedidos.js

   Funcionalidades:
   - Crear pedidos
   - Registrar productos comprados
   - Asociar órdenes de Mercado Pago
   - Consultar pedidos
   - Actualizar estados de pago
   - Descontar inventario automáticamente
   - Evitar descuentos duplicados
   - Registrar historial de pedidos e inventario

   ENTORNO: TEST
===================================================== */

const { db } = require("./conexion.js");

// =====================================================
// CONSULTAS PREPARADAS
// =====================================================

const insertarPedido = db.prepare(`
    INSERT INTO pedidos (
        referencia,
        total,
        estado_pago,
        estado_preparacion
    )
    VALUES (?, ?, 'pendiente', 'Pendiente')
`);

const insertarDetalle = db.prepare(`
    INSERT INTO pedido_detalles (
        pedido_id,
        producto_id,
        nombre,
        marca,
        cantidad,
        precio
    )
    VALUES (?, ?, ?, ?, ?, ?)
`);

const insertarHistorial = db.prepare(`
    INSERT INTO pedido_historial (
        pedido_id,
        descripcion
    )
    VALUES (?, ?)
`);

// =====================================================
// CREAR PEDIDO
// =====================================================

function crearPedido({ referencia, total, productos }) {
    if (
        typeof referencia !== "string" ||
        !referencia.trim() ||
        !Number.isSafeInteger(total) ||
        total <= 0 ||
        !Array.isArray(productos) ||
        productos.length === 0
    ) {
        throw new Error("Datos del pedido inválidos.");
    }

    let transaccionAbierta = false;

    try {
        db.exec("BEGIN IMMEDIATE");
        transaccionAbierta = true;

        const resultado = insertarPedido.run(
            referencia,
            total
        );

        const pedidoId = Number(
            resultado.lastInsertRowid
        );

        for (const producto of productos) {
            insertarDetalle.run(
                pedidoId,
                producto.id,
                producto.nombre,
                producto.marca,
                producto.cantidad,
                producto.precio
            );
        }

        insertarHistorial.run(
            pedidoId,
            "Pedido creado. Pendiente de pago."
        );

        db.exec("COMMIT");
        transaccionAbierta = false;

        return pedidoId;

    } catch (error) {
        if (transaccionAbierta) {
            try {
                db.exec("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error revirtiendo creación de pedido:",
                    rollbackError
                );
            }
        }

        throw error;
    }
}

// =====================================================
// ASOCIAR ORDEN DE MERCADO PAGO
// =====================================================

function asociarOrdenMercadoPago(pedidoId, orderId) {
    if (
        !Number.isSafeInteger(pedidoId) ||
        pedidoId <= 0 ||
        typeof orderId !== "string" ||
        !orderId.trim()
    ) {
        throw new Error(
            "Datos de asociación de orden inválidos."
        );
    }

    const resultado = db.prepare(`
        UPDATE pedidos
        SET mercado_pago_order_id = ?,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?
          AND mercado_pago_order_id IS NULL
    `).run(orderId, pedidoId);

    if (resultado.changes !== 1) {
        throw new Error(
            "No se pudo asociar la orden de Mercado Pago."
        );
    }
}

// =====================================================
// BUSCAR PEDIDO POR ORDEN DE MERCADO PAGO
// =====================================================

function obtenerPedidoPorOrden(orderId) {
    return db.prepare(`
        SELECT *
        FROM pedidos
        WHERE mercado_pago_order_id = ?
    `).get(orderId);
}

// =====================================================
// ACTUALIZAR ESTADO DE PAGO
// =====================================================

function actualizarEstadoPago(pedidoId, estado) {
    const estadosValidos = [
        "pendiente",
        "rechazado",
        "revision"
    ];

    if (!estadosValidos.includes(estado)) {
        throw new Error(
            "Estado de pago inválido."
        );
    }

    let transaccionAbierta = false;

    try {
        db.exec("BEGIN IMMEDIATE");
        transaccionAbierta = true;

        const pedido = db.prepare(`
            SELECT
                estado_pago,
                stock_descontado
            FROM pedidos
            WHERE id = ?
        `).get(pedidoId);

        if (!pedido) {
            throw new Error("Pedido no encontrado.");
        }

        let nuevoEstado = estado;

        // Una venta con stock descontado no puede
        // retroceder automáticamente a pendiente
        // o rechazado.
        //
        // Si existe una posible devolución o
        // incidencia, permitimos pasar a revisión.
        if (pedido.stock_descontado === 1) {
            nuevoEstado =
                estado === "revision"
                    ? "revision"
                    : pedido.estado_pago;
        }

        // Protección adicional para pedidos aprobados.
        if (
            pedido.estado_pago === "aprobado" &&
            nuevoEstado !== "revision"
        ) {
            nuevoEstado = "aprobado";
        }

        if (pedido.estado_pago !== nuevoEstado) {
            db.prepare(`
                UPDATE pedidos
                SET estado_pago = ?,
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(
                nuevoEstado,
                pedidoId
            );

            insertarHistorial.run(
                pedidoId,
                `Pago: ${pedido.estado_pago} → ${nuevoEstado}`
            );
        }

        db.exec("COMMIT");
        transaccionAbierta = false;

        return nuevoEstado;

    } catch (error) {
        if (transaccionAbierta) {
            try {
                db.exec("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error revirtiendo estado de pago:",
                    rollbackError
                );
            }
        }

        throw error;
    }
}

// =====================================================
// CONFIRMAR PAGO Y DESCONTAR INVENTARIO
// =====================================================

function confirmarPagoYDescontarInventario(pedidoId) {
    if (
        !Number.isSafeInteger(pedidoId) ||
        pedidoId <= 0
    ) {
        throw new Error(
            "Identificador de pedido inválido."
        );
    }

    let transaccionAbierta = false;

    try {
        db.exec("BEGIN IMMEDIATE");
        transaccionAbierta = true;

        const pedido = db.prepare(`
            SELECT
                id,
                estado_pago,
                stock_descontado
            FROM pedidos
            WHERE id = ?
        `).get(pedidoId);

        if (!pedido) {
            throw new Error("Pedido no encontrado.");
        }

        // =============================================
        // EVITAR DESCUENTOS DUPLICADOS
        // =============================================

        if (pedido.stock_descontado === 1) {
            db.exec("COMMIT");
            transaccionAbierta = false;

            // No descontar nuevamente el inventario.
            // Conservar el estado actual del pedido.
            return pedido.estado_pago;
        }

        // =============================================
        // OBTENER PRODUCTOS DEL PEDIDO
        // =============================================

        const detalles = db.prepare(`
            SELECT
                producto_id AS productoId,
                SUM(cantidad) AS cantidad
            FROM pedido_detalles
            WHERE pedido_id = ?
            GROUP BY producto_id
        `).all(pedidoId);

        if (detalles.length === 0) {
            throw new Error(
                "El pedido no tiene productos registrados."
            );
        }

        const productos = [];

        let stockInsuficiente = false;

        // =============================================
        // COMPROBAR STOCK ANTES DE DESCONTAR
        // =============================================

        for (const detalle of detalles) {
            const producto = db.prepare(`
                SELECT
                    id,
                    nombre,
                    stock
                FROM productos
                WHERE id = ?
            `).get(detalle.productoId);

            if (
                !producto ||
                !Number.isSafeInteger(detalle.cantidad) ||
                detalle.cantidad <= 0 ||
                !Number.isSafeInteger(producto.stock) ||
                producto.stock < detalle.cantidad
            ) {
                stockInsuficiente = true;
                break;
            }

            productos.push({
                ...producto,
                cantidad: detalle.cantidad
            });
        }

        // =============================================
        // STOCK INSUFICIENTE
        // =============================================

        if (stockInsuficiente) {
            if (pedido.estado_pago !== "revision") {
                db.prepare(`
                    UPDATE pedidos
                    SET estado_pago = 'revision',
                        actualizado_en = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(pedidoId);

                insertarHistorial.run(
                    pedidoId,
                    "Pago acreditado. Stock insuficiente: " +
                    "requiere revisión manual."
                );
            }

            db.exec("COMMIT");
            transaccionAbierta = false;

            return "revision";
        }

        // =============================================
        // DESCONTAR PRODUCTOS
        // =============================================

        for (const producto of productos) {
            const stockAnterior = producto.stock;

            const stockNuevo =
                stockAnterior - producto.cantidad;

            const resultado = db.prepare(`
                UPDATE productos
                SET stock = ?,
                    actualizado_en = CURRENT_TIMESTAMP
                WHERE id = ?
                  AND stock = ?
                  AND stock >= ?
            `).run(
                stockNuevo,
                producto.id,
                stockAnterior,
                producto.cantidad
            );

            if (resultado.changes !== 1) {
                throw new Error(
                    "No se pudo actualizar el stock " +
                    `del producto ${producto.id}.`
                );
            }

            // =========================================
            // REGISTRAR MOVIMIENTO DE INVENTARIO
            // =========================================

            db.prepare(`
                INSERT INTO movimientos_inventario (
                    producto_id,
                    usuario_id,
                    tipo,
                    cantidad,
                    stock_anterior,
                    stock_nuevo,
                    motivo
                )
                VALUES (
                    ?,
                    NULL,
                    'salida',
                    ?,
                    ?,
                    ?,
                    ?
                )
            `).run(
                producto.id,
                producto.cantidad,
                stockAnterior,
                stockNuevo,
                `Venta automática - Pedido #${pedidoId}`
            );
        }

        // =============================================
        // APROBAR PEDIDO
        // =============================================

        const actualizacion = db.prepare(`
            UPDATE pedidos
            SET estado_pago = 'aprobado',
                stock_descontado = 1,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id = ?
              AND stock_descontado = 0
        `).run(pedidoId);

        if (actualizacion.changes !== 1) {
            throw new Error(
                "No se pudo confirmar el descuento " +
                "del pedido."
            );
        }

        // =============================================
        // REGISTRAR HISTORIAL
        // =============================================

        insertarHistorial.run(
            pedidoId,
            "Pago acreditado. Inventario " +
            "descontado automáticamente."
        );

        db.exec("COMMIT");
        transaccionAbierta = false;

        return "aprobado";

    } catch (error) {
        if (transaccionAbierta) {
            try {
                db.exec("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Error revirtiendo venta:",
                    rollbackError
                );
            }
        }

        throw error;
    }
}

// =====================================================
// LISTAR PEDIDOS
// =====================================================

function listarPedidos() {
    return db.prepare(`
        SELECT
            p.id,
            p.referencia,
            p.mercado_pago_order_id AS orderId,
            p.cliente_nombre AS cliente,
            p.cliente_email AS email,
            p.total,
            p.estado_pago AS estadoPago,
            p.estado_preparacion AS preparacion,
            p.stock_descontado AS stockDescontado,
            p.creado_en AS fecha,
            COUNT(d.id) AS cantidadProductos
        FROM pedidos p
        LEFT JOIN pedido_detalles d
            ON d.pedido_id = p.id
        GROUP BY p.id
        ORDER BY p.id DESC
        LIMIT 200
    `).all();
}

// =====================================================
// OBTENER DETALLE E HISTORIAL DEL PEDIDO
// =====================================================

function obtenerDetallePedido(id) {
    const pedido = db.prepare(`
        SELECT *
        FROM pedidos
        WHERE id = ?
    `).get(id);

    if (!pedido) {
        return null;
    }

    const productos = db.prepare(`
        SELECT
            producto_id AS productoId,
            nombre,
            marca,
            cantidad,
            precio
        FROM pedido_detalles
        WHERE pedido_id = ?
        ORDER BY id
    `).all(id);

    const historial = db.prepare(`
        SELECT
            descripcion,
            creado_en AS fecha
        FROM pedido_historial
        WHERE pedido_id = ?
        ORDER BY id DESC
    `).all(id);

    return {
        ...pedido,
        productos,
        historial
    };
}

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
    crearPedido,
    asociarOrdenMercadoPago,
    obtenerPedidoPorOrden,
    actualizarEstadoPago,
    confirmarPagoYDescontarInventario,
    listarPedidos,
    obtenerDetallePedido
};
