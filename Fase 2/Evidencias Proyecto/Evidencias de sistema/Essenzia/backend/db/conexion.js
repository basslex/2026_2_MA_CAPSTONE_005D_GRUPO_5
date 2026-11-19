
const { DatabaseSync } = require("node:sqlite");
const { mkdirSync } = require("node:fs");
const path = require("node:path");

// Carpeta donde se almacenará la base de datos
const carpetaDatos = path.join(__dirname, "../data");

// Crear la carpeta si todavía no existe
mkdirSync(carpetaDatos, {
    recursive: true
});

// Ruta del archivo SQLite
const rutaBD = path.join(carpetaDatos, "essenzia.db");

// Abrir o crear la base de datos
const db = new DatabaseSync(rutaBD);

// Configuración de SQLite
db.exec("PRAGMA foreign_keys = ON;");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA busy_timeout = 5000;");

console.log("Base de datos SQLite conectada.");

// Exportar conexión
module.exports = { db };
