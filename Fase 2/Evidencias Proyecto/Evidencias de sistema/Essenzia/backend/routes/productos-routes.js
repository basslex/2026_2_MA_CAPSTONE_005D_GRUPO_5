
const express = require("express");
const { db } = require("../db/conexion.js");

const {
    requerirAutenticacion,
    requerirAdministrador
} = require("./auth-routes.js");

const router = express.Router();

const categorias = ["disenador", "arabe", "nicho"];
const generos = ["hombre", "mujer", "unisex"];

function convertirProducto(fila) {
    let extra = {};

    try {
        extra = JSON.parse(fila.datos_extra || "{}");
    } catch {
        extra = {};
    }

    return {
        id: fila.id,
        nombre: fila.nombre,
        marca: fila.marca,
        categoria: fila.categoria,
        genero: fila.genero,
        familia: fila.familia,
        precio: fila.precio,
        imagen: fila.imagen,
        descripcion: fila.descripcion,
        stock: fila.stock,
        activo: Boolean(fila.activo),
        ...extra
    };
}

function validarProducto(datos) {
    if (!datos || typeof datos !== "object") {
        return "Los datos del producto no son válidos.";
    }

    if (
        typeof datos.nombre !== "string" ||
        datos.nombre.trim().length < 2 ||
        datos.nombre.trim().length > 120
    ) {
        return "El nombre debe tener entre 2 y 120 caracteres.";
    }

    if (
        typeof datos.marca !== "string" ||
        datos.marca.trim().length < 2 ||
        datos.marca.trim().length > 80
    ) {
        return "La marca debe tener entre 2 y 80 caracteres.";
    }

    if (!categorias.includes(datos.categoria)) {
        return "La categoría no es válida.";
    }

    if (!generos.includes(datos.genero)) {
        return "El género no es válido.";
    }

    if (
        typeof datos.familia !== "string" ||
        !datos.familia.trim() ||
        datos.familia.length > 80
    ) {
        return "La familia olfativa no es válida.";
    }

    if (
        !Number.isSafeInteger(datos.precio) ||
        datos.precio < 1 ||
        datos.precio > 99999999
    ) {
        return "El precio no es válido.";
    }

    if (
        datos.imagen !== undefined &&
        (
            typeof datos.imagen !== "string" ||
            (
                datos.imagen !== "" &&
                !/^img\/perfumes\/[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i
                    .test(datos.imagen)
            )
        )
    ) {
        return "La ruta de imagen no es válida.";
    }

    if (
        datos.descripcion !== undefined &&
        (
            typeof datos.descripcion !== "string" ||
            datos.descripcion.length > 500
        )
    ) {
        return "La descripción supera los 500 caracteres.";
    }

    return null;
}

// Todas las rutas de este archivo son administrativas.
router.use(requerirAutenticacion, requerirAdministrador);


const ORIGENES_PERMITIDOS = new Set([
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]);

router.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const origen = req.get("Origin");

    if (!origen || !ORIGENES_PERMITIDOS.has(origen)) {
        return res.status(403).json({
            error: "Origen de solicitud no autorizado."
        });
    }

    next();
});


// GET /api/admin/productos
router.get("/", (req, res) => {
    try {
        const filas = db.prepare(`
            SELECT *
            FROM productos
            ORDER BY id ASC
        `).all();

        return res.json({
            productos: filas.map(convertirProducto)
        });
    } catch (error) {
        console.error("Error consultando productos:", error);

        return res.status(500).json({
            error: "No se pudieron cargar los productos."
        });
    }
});

// POST /api/admin/productos
router.post("/", (req, res) => {
    try {
        const datos = req.body || {};
        const error = validarProducto(datos);

        if (error) {
            return res.status(400).json({ error });
        }

        const resultado = db.prepare(`
            INSERT INTO productos (
                nombre, marca, categoria, genero,
                familia, precio, imagen, descripcion,
                stock, activo, datos_extra
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1, '{}')
        `).run(
            datos.nombre.trim(),
            datos.marca.trim(),
            datos.categoria,
            datos.genero,
            datos.familia.trim(),
            datos.precio,
            datos.imagen || "",
            datos.descripcion || ""
        );

        const producto = db.prepare(`
            SELECT * FROM productos WHERE id = ?
        `).get(Number(resultado.lastInsertRowid));

        return res.status(201).json({
            mensaje: "Producto creado correctamente.",
            producto: convertirProducto(producto)
        });
    } catch (error) {
        console.error("Error creando producto:", error);

        return res.status(500).json({
            error: "No se pudo crear el producto."
        });
    }
});

// PUT /api/admin/productos/:id
router.put("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                error: "ID de producto inválido."
            });
        }

        const datos = req.body || {};
        const error = validarProducto(datos);

        if (error) {
            return res.status(400).json({ error });
        }

        const resultado = db.prepare(`
            UPDATE productos
            SET nombre = ?,
                marca = ?,
                categoria = ?,
                genero = ?,
                familia = ?,
                precio = ?,
                imagen = ?,
                descripcion = ?,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            datos.nombre.trim(),
            datos.marca.trim(),
            datos.categoria,
            datos.genero,
            datos.familia.trim(),
            datos.precio,
            datos.imagen || "",
            datos.descripcion || "",
            id
        );

        if (!resultado.changes) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        const producto = db.prepare(`
            SELECT * FROM productos WHERE id = ?
        `).get(id);

        return res.json({
            mensaje: "Producto actualizado correctamente.",
            producto: convertirProducto(producto)
        });
    } catch (error) {
        console.error("Error editando producto:", error);

        return res.status(500).json({
            error: "No se pudo actualizar el producto."
        });
    }
});

// PATCH /api/admin/productos/:id/estado
router.patch("/:id/estado", (req, res) => {
    try {
        const id = Number(req.params.id);
        const { activo } = req.body || {};

        if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            typeof activo !== "boolean"
        ) {
            return res.status(400).json({
                error: "Datos de estado inválidos."
            });
        }

        const resultado = db.prepare(`
            UPDATE productos
            SET activo = ?,
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(activo ? 1 : 0, id);

        if (!resultado.changes) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        return res.json({
            mensaje: activo
                ? "Producto reactivado correctamente."
                : "Producto desactivado correctamente."
        });
    } catch (error) {
        console.error("Error cambiando estado:", error);

        return res.status(500).json({
            error: "No se pudo cambiar el estado."
        });
    }
});

module.exports = router;
