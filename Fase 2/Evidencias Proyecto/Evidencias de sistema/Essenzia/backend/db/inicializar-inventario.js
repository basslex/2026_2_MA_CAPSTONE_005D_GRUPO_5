
/* =====================================================
   ESSENZIA - INICIALIZAR INVENTARIO
   Archivo: backend/db/inicializar-inventario.js
===================================================== */

const { db } = require("./conexion.js");

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS movimientos_inventario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            producto_id INTEGER NOT NULL,
            usuario_id INTEGER NOT NULL,

            tipo TEXT NOT NULL
                CHECK (tipo IN ('entrada', 'salida')),

            cantidad INTEGER NOT NULL
                CHECK (cantidad > 0),

            stock_anterior INTEGER NOT NULL
                CHECK (stock_anterior >= 0),

            stock_nuevo INTEGER NOT NULL
                CHECK (stock_nuevo >= 0),

            motivo TEXT NOT NULL,

            creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (producto_id)
                REFERENCES productos(id),

            FOREIGN KEY (usuario_id)
                REFERENCES usuarios(id)
        );

        CREATE INDEX IF NOT EXISTS idx_movimientos_producto
        ON movimientos_inventario(producto_id);

        CREATE INDEX IF NOT EXISTS idx_movimientos_fecha
        ON movimientos_inventario(creado_en);
    `);

    console.log("Tabla de movimientos de inventario preparada.");
    console.log("Los datos existentes se conservaron.");

} catch (error) {
    console.error("Error inicializando inventario:", error);
    process.exitCode = 1;
} finally {
    db.close();
}
