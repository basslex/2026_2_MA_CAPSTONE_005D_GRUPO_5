
/* =====================================================
   ESSENZIA - CATÁLOGO PÚBLICO
   Archivo: backend/routes/catalogo-publico-routes.js

   Funcionalidades:
   - Consultar productos desde SQLite
   - Mostrar solamente productos activos
   - Obtener precios actualizados
   - Permitir acceso a clientes e invitados
===================================================== */

const express = require("express");
const { db } = require("../db/conexion.js");

const router = express.Router();

// =====================================================
// 1. NORMALIZAR PRODUCTO
// =====================================================

function normalizarProducto(producto) {
    let datosExtra = {};

    try {
        datosExtra = producto.datos_extra
            ? JSON.parse(producto.datos_extra)
            : {};
    } catch (error) {
        console.warn(
            "Datos adicionales inválidos:",
            producto.id
        );
    }

    return {
        ...datosExtra,

        id: producto.id,
        nombre: producto.nombre,
        marca: producto.marca,

        categoria: producto.categoria,
        genero: producto.genero,
        familia: producto.familia,

        precio: producto.precio,
        imagen: producto.imagen,

        descripcion: producto.descripcion || "",
        stock: producto.stock,

        activo: producto.activo,

        ocasion: Array.isArray(datosExtra.ocasion)
            ? datosExtra.ocasion
            : [],

        clima: Array.isArray(datosExtra.clima)
            ? datosExtra.clima
            : [],

        shade: datosExtra.shade || "#e8e3da",
        liquid: datosExtra.liquid || "#d4af37"
    };
}

// =====================================================
// 2. OBTENER PRODUCTOS ACTIVOS
// =====================================================

// GET /api/productos

router.get("/", (req, res) => {
    try {
        const productos = db.prepare(`
            SELECT *
            FROM productos
            WHERE activo = 1
            ORDER BY id ASC
        `).all();

        return res.json({
            total: productos.length,
            productos: productos.map(normalizarProducto)
        });

    } catch (error) {
        console.error(
            "Error consultando catálogo público:",
            error
        );

        return res.status(500).json({
            error: "No se pudo cargar el catálogo."
        });
    }
});

// =====================================================
// 3. OBTENER UN PRODUCTO POR ID
// =====================================================

// GET /api/productos/:id

router.get("/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                error: "ID de producto inválido."
            });
        }

        const producto = db.prepare(`
            SELECT *
            FROM productos
            WHERE id = ?
              AND activo = 1
        `).get(id);

        if (!producto) {
            return res.status(404).json({
                error: "Producto no encontrado."
            });
        }

        return res.json({
            producto: normalizarProducto(producto)
        });

    } catch (error) {
        console.error(
            "Error consultando producto:",
            error
        );

        return res.status(500).json({
            error: "No se pudo consultar el producto."
        });
    }
});

module.exports = router;
