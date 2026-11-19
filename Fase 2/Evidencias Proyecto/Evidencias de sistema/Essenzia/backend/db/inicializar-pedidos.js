
/* =====================================================
   ESSENZIA - INICIALIZAR PEDIDOS
   Archivo: backend/db/inicializar-pedidos.js
===================================================== */

const { db } = require("./conexion.js");

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            referencia TEXT NOT NULL UNIQUE,

            mercado_pago_order_id TEXT UNIQUE,

            usuario_id INTEGER,

            cliente_nombre TEXT NOT NULL DEFAULT '',
            cliente_email TEXT NOT NULL DEFAULT '',

            total INTEGER NOT NULL
                CHECK (total > 0),

            estado_pago TEXT NOT NULL DEFAULT 'pendiente'
                CHECK (
                    estado_pago IN (
                        'pendiente',
                        'aprobado',
                        'rechazado',
                        'revision'
                    )
                ),

            estado_preparacion TEXT NOT NULL DEFAULT 'Pendiente'
                CHECK (
                    estado_preparacion IN (
                        'Pendiente',
                        'Preparando',
                        'Enviado',
                        'Entregado'
                    )
                ),

            stock_descontado INTEGER NOT NULL DEFAULT 0
                CHECK (stock_descontado IN (0, 1)),

            creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS pedido_detalles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            pedido_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,

            nombre TEXT NOT NULL,
            marca TEXT NOT NULL,

            cantidad INTEGER NOT NULL
                CHECK (cantidad > 0),

            precio INTEGER NOT NULL
                CHECK (precio > 0),

            FOREIGN KEY (pedido_id)
                REFERENCES pedidos(id),

            FOREIGN KEY (producto_id)
                REFERENCES productos(id)
        );

        CREATE TABLE IF NOT EXISTS pedido_historial (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            pedido_id INTEGER NOT NULL,
            usuario_id INTEGER,

            descripcion TEXT NOT NULL,

            creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (pedido_id)
                REFERENCES pedidos(id),

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
        );

        CREATE INDEX IF NOT EXISTS idx_pedidos_usuario
            ON pedidos(usuario_id);

        CREATE INDEX IF NOT EXISTS idx_pedidos_pago
            ON pedidos(estado_pago);

        CREATE INDEX IF NOT EXISTS idx_pedido_detalles_pedido
            ON pedido_detalles(pedido_id);

        CREATE INDEX IF NOT EXISTS idx_pedido_historial_pedido
            ON pedido_historial(pedido_id);
    `);

    console.log("Tablas de pedidos preparadas correctamente.");
    console.log("Los datos existentes se conservaron.");

} catch (error) {
    console.error("Error inicializando pedidos:", error);
    process.exitCode = 1;
} finally {
    db.close();
}
