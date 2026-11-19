
const { DatabaseSync, backup } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const origen = path.join(__dirname, "../data/essenzia.db");
const carpetaRespaldos = path.join(__dirname, "../backups");

fs.mkdirSync(carpetaRespaldos, { recursive: true });

if (!fs.existsSync(origen)) {
    console.error("No existe la base de datos.");
    process.exit(1);
}

const fecha = new Date().toISOString().replace(/[:.]/g, "-");
const destino = path.join(
    carpetaRespaldos,
    `essenzia-${fecha}.db`
);

async function crearRespaldo() {
    let db;

    try {
        db = new DatabaseSync(origen, { readOnly: true });

        await backup(db, destino);

        console.log("Respaldo creado correctamente:");
        console.log(destino);

    } catch (error) {
        console.error("Error al respaldar:", error.message);
        process.exitCode = 1;

    } finally {
        if (db) db.close();
    }
}

crearRespaldo();
