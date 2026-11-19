
const { db } = require("./conexion.js");

// Crear las tablas necesarias para la autenticación
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nombre TEXT NOT NULL,

        email TEXT NOT NULL COLLATE NOCASE UNIQUE,

        password_hash TEXT NOT NULL,

        rol TEXT NOT NULL DEFAULT 'cliente'
            CHECK (rol IN ('cliente', 'admin')),

        email_verificado INTEGER NOT NULL DEFAULT 0
            CHECK (email_verificado IN (0, 1)),

        activo INTEGER NOT NULL DEFAULT 1
            CHECK (activo IN (0, 1)),

        creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sesiones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        usuario_id INTEGER NOT NULL,

        token_hash TEXT NOT NULL UNIQUE,

        creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        expira_en TEXT NOT NULL,

        revocado_en TEXT,

        FOREIGN KEY (usuario_id)
            REFERENCES usuarios(id)
            ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
        ON sesiones(usuario_id);

    CREATE INDEX IF NOT EXISTS idx_sesiones_expiracion
        ON sesiones(expira_en);
`);

console.log("Tablas de usuarios y sesiones preparadas.");

// Cerrar la conexión después de inicializar
db.close();

console.log("Inicialización completada correctamente.");
