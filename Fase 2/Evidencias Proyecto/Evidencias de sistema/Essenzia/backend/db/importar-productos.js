
/* ==============================================
   ESSENZIA - IMPORTACIÓN DE PRODUCTOS A SQLITE
   Archivo: backend/db/importar-productos.js

   Conserva los productos existentes.
   No modifica usuarios ni sesiones.
============================================== */

const fs = require("node:fs");
const path = require("node:path");
const { db } = require("./conexion.js");

async function importarProductos() {
    const rutaCatalogo = path.resolve(
        __dirname,
        "../../frontend/js/data/perfumes.js"
    );

    if (!fs.existsSync(rutaCatalogo)) {
        throw new Error(
            "No se encontró frontend/js/data/perfumes.js"
        );
    }

    // Cargar el catálogo original como módulo ES.
    const contenido = fs.readFileSync(
        rutaCatalogo,
        "utf8"
    );

    const modulo = await import(
        "data:text/javascript;base64," +
        Buffer.from(contenido, "utf8").toString("base64")
    );

    const perfumes = modulo.perfumes;

    if (!Array.isArray(perfumes) || perfumes.length === 0) {
        throw new Error("El catálogo está vacío o no es válido.");
    }

    const ids = new Set();

    for (const perfume of perfumes) {
        if (
            !Number.isSafeInteger(perfume.id) ||
            perfume.id < 1 ||
            ids.has(perfume.id) ||
            typeof perfume.nombre !== "string" ||
            typeof perfume.marca !== "string" ||
            !Number.isSafeInteger(perfume.precio) ||
            perfume.precio < 1
        ) {
            throw new Error(
                `Producto inválido o duplicado: ${perfume.id}`
            );
        }

        ids.add(perfume.id);
    }

    // Crear la tabla sin eliminar las existentes.
    db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY,
            nombre TEXT NOT NULL,
            marca TEXT NOT NULL,
            categoria TEXT NOT NULL
                CHECK (categoria IN (
                    'disenador', 'arabe', 'nicho'
                )),
            genero TEXT NOT NULL
                CHECK (genero IN (
                    'hombre', 'mujer', 'unisex'
                )),
            familia TEXT NOT NULL,
            precio INTEGER NOT NULL
                CHECK (precio > 0),
            imagen TEXT NOT NULL DEFAULT '',
            descripcion TEXT NOT NULL DEFAULT '',
            stock INTEGER NOT NULL DEFAULT 0
                CHECK (stock >= 0),
            activo INTEGER NOT NULL DEFAULT 1
                CHECK (activo IN (0, 1)),
            datos_extra TEXT NOT NULL DEFAULT '{}',
            creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS
            idx_productos_categoria
            ON productos(categoria);

        CREATE INDEX IF NOT EXISTS
            idx_productos_activo
            ON productos(activo);
    `);

    const insertar = db.prepare(`
        INSERT OR IGNORE INTO productos (
            id,
            nombre,
            marca,
            categoria,
            genero,
            familia,
            precio,
            imagen,
            descripcion,
            stock,
            activo,
            datos_extra
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importados = 0;

    db.exec("BEGIN TRANSACTION");

    try {
        for (const perfume of perfumes) {
            const datosExtra = {
                ocasion: perfume.ocasion || [],
                clima: perfume.clima || [],
                notas: perfume.notas || {
                    salida: [],
                    corazon: [],
                    fondo: []
                },
                shade: perfume.shade || "#eeeeee",
                liquid: perfume.liquid || "#c5a268"
            };

            const resultado = insertar.run(
                perfume.id,
                perfume.nombre,
                perfume.marca,
                perfume.categoria,
                perfume.genero,
                perfume.familia,
                perfume.precio,
                perfume.imagen || "",
                perfume.descripcion || "",
                0,
                1,
                JSON.stringify(datosExtra)
            );

            importados += Number(resultado.changes);
        }

        db.exec("COMMIT");

    } catch (error) {
        db.exec("ROLLBACK");
        throw error;
    }

    const resumen = db.prepare(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN categoria = 'disenador'
                THEN 1 ELSE 0 END) AS disenador,
            SUM(CASE WHEN categoria = 'arabe'
                THEN 1 ELSE 0 END) AS arabe,
            SUM(CASE WHEN categoria = 'nicho'
                THEN 1 ELSE 0 END) AS nicho
        FROM productos
    `).get();

    console.log("=================================");
    console.log("ESSENZIA - IMPORTACIÓN COMPLETADA");
    console.log("=================================");
    console.log("Productos nuevos:", importados);
    console.log("Total en SQLite:", resumen.total);
    console.log("Diseñador:", resumen.disenador);
    console.log("Árabes:", resumen.arabe);
    console.log("Nicho:", resumen.nicho);
    console.log("=================================");
}

importarProductos()
    .catch(error => {
        console.error(
            "Error importando productos:",
            error.message
        );
        process.exitCode = 1;
    })
    .finally(() => {
        db.close();
    });
