
/* =====================================================
   ESSENZIA - MOVIMIENTOS AUTOMÁTICOS
   Archivo: backend/db/permitir-movimientos-automaticos.js

   Permite movimientos sin usuario administrador.
   Conserva el historial existente.
===================================================== */

const { db } = require("./conexion.js");

let transaccionAbierta = false;

try {
    const columnas = db.prepare(`
        PRAGMA table_info(movimientos_inventario)
    `).all();

    if (columnas.length === 0) {
        throw new Error(
            "La tabla movimientos_inventario no existe."
        );
    }

    const columnaUsuario = columnas.find(
        columna => columna.name === "usuario_id"
    );

    if (!columnaUsuario) {
        throw new Error(
            "No se encontró la columna usuario_id."
        );
    }

    if (columnaUsuario.notnull === 0) {
        console.log(
            "El inventario ya permite movimientos automáticos."
        );
    } else {
        db.exec("PRAGMA foreign_keys = OFF");
        db.exec("BEGIN IMMEDIATE");
        transaccionAbierta = true;

        db.exec(`
            CREATE TABLE movimientos_inventario_nueva (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                producto_id INTEGER NOT NULL,
                usuario_id INTEGER,

                tipo TEXT NOT NULL
                    CHECK (tipo IN ('entrada', 'salida')),

                cantidad INTEGER NOT NULL
                    CHECK (cantidad > 0),

                stock_anterior INTEGER NOT NULL
                    CHECK (stock_anterior >= 0),

                stock_nuevo INTEGER NOT NULL
                    CHECK (stock_nuevo >= 0),

                motivo TEXT NOT NULL,

                creado_en TEXT NOT NULL
                    DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (producto_id)
                    REFERENCES productos(id),

                FOREIGN KEY (usuario_id)
                    REFERENCES usuarios(id)
            );

            INSERT INTO movimientos_inventario_nueva (
                id,
                producto_id,
                usuario_id,
                tipo,
                cantidad,
                stock_anterior,
                stock_nuevo,
                motivo,
                creado_en
            )
            SELECT
                id,
                producto_id,
                usuario_id,
                tipo,
                cantidad,
                stock_anterior,
                stock_nuevo,
                motivo,
                creado_en
            FROM movimientos_inventario;

            DROP TABLE movimientos_inventario;

            ALTER TABLE movimientos_inventario_nueva
            RENAME TO movimientos_inventario;

            CREATE INDEX idx_movimientos_producto
            ON movimientos_inventario(producto_id);

            CREATE INDEX idx_movimientos_fecha
            ON movimientos_inventario(creado_en);
        `);

        const errores = db.prepare(
            "PRAGMA foreign_key_check"
        ).all();

        if (errores.length > 0) {
            throw new Error(
                "Se detectaron problemas de integridad referencial."
            );
        }

        db.exec("COMMIT");
        transaccionAbierta = false;

        console.log(
            "Tabla de inventario actualizada correctamente."
        );
        console.log(
            "Los movimientos existentes se conservaron."
        );
        console.log(
            "Las ventas automáticas podrán registrarse sin usuario."
        );
    }

} catch (error) {
    if (transaccionAbierta) {
        try {
            db.exec("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Error al revertir:",
                rollbackError
            );
        }
    }

    console.error(
        "Error preparando movimientos automáticos:",
        error
    );

    process.exitCode = 1;

} finally {
    try {
        db.exec("PRAGMA foreign_keys = ON");
    } finally {
        db.close();
    }
}
