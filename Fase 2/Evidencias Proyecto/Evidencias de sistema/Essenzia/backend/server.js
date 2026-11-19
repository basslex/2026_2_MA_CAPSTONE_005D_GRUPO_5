
/* =====================================================
   ESSENZIA - BACKEND PRINCIPAL
   Archivo: backend/server.js

   Funcionalidades:
   - Express y CORS
   - Autenticación con SQLite
   - Administración de productos
   - Administración de inventario
   - Catálogo público
   - Mercado Pago Checkout Pro - Orders API
   - Registro persistente de pedidos en SQLite
   - Validación de stock antes del checkout
   - Consulta de pagos
   - Consulta administrativa de pedidos

   ENTORNO: TEST
===================================================== */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { randomUUID } = require("node:crypto");

// =====================================================
// 1. BASE DE DATOS
// =====================================================

const { db } = require("./db/conexion.js");

const {
    crearPedido,
    asociarOrdenMercadoPago
} = require("./db/pedidos.js");

// =====================================================
// 2. IMPORTAR RUTAS
// =====================================================

const authRoutes = require("./routes/auth-routes.js");

const productosRoutes = require(
    "./routes/productos-routes.js"
);

const inventarioRoutes = require(
    "./routes/inventario-routes.js"
);

const catalogoPublicoRoutes = require(
    "./routes/catalogo-publico-routes.js"
);

const pedidosRoutes = require(
    "./routes/pedidos-routes.js"
);

const webhookRoutes = require(
    "./routes/webhook-routes.js"
);

const {
    verificarOrdenMercadoPago
} = require("./services/verificar-pago.js");

// =====================================================
// 3. CONFIGURACIÓN GENERAL
// =====================================================

const app = express();

const PORT = Number(process.env.PORT) || 3000;

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const FRONTEND_URL = process.env.FRONTEND_URL || "";

// =====================================================
// 4. VALIDAR ENTORNO DE MERCADO PAGO
// =====================================================

if (process.env.MP_ENV !== "TEST") {
    console.error(
        "Inicio bloqueado: Essenzia debe ejecutarse en modo TEST."
    );

    process.exit(1);
}

if (
    !MP_ACCESS_TOKEN ||
    MP_ACCESS_TOKEN ===
        "TU_ACCESS_TOKEN_DEL_ENTORNO_PRUEBA"
) {
    console.error(
        "Debes configurar un Access Token de prueba válido."
    );

    process.exit(1);
}

// =====================================================
// 5. MIDDLEWARES DE EXPRESS
// =====================================================

app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ],
        credentials: true
    })
);

app.use(
    express.json({
        limit: "20kb"
    })
);

// =====================================================
// 6. REGISTRAR RUTAS
// =====================================================

// Autenticación
app.use("/api/auth", authRoutes);

// Administración de productos
app.use(
    "/api/admin/productos",
    productosRoutes
);

// Administración de inventario
app.use(
    "/api/admin/inventario",
    inventarioRoutes
);

// Administración de pedidos
app.use(
    "/api/admin/pedidos",
    pedidosRoutes
);

// Notificaciones de Mercado Pago
app.use(
    "/api/pagos/webhook",
    webhookRoutes
);

// Catálogo público
app.use(
    "/api/productos",
    catalogoPublicoRoutes
);

// =====================================================
// 7. FUNCIONES AUXILIARES
// =====================================================

// Consultar un producto activo desde SQLite.
function obtenerProducto(id) {
    const productoId = Number(id);

    if (
        !Number.isSafeInteger(productoId) ||
        productoId <= 0
    ) {
        return null;
    }

    const producto = db.prepare(`
        SELECT
            id,
            nombre,
            marca,
            precio,
            stock,
            activo
        FROM productos
        WHERE id = ?
          AND activo = 1
    `).get(productoId);

    if (!producto) {
        return null;
    }

    if (
        !Number.isSafeInteger(producto.precio) ||
        producto.precio <= 0
    ) {
        return null;
    }

    return producto;
}

// =====================================================
// 8. CONFIGURACIÓN DE URLS DE RETORNO
// =====================================================

function obtenerConfiguracionRetorno() {
    if (!FRONTEND_URL) {
        return null;
    }

    const url = new URL(FRONTEND_URL);

    if (url.protocol !== "https:") {
        throw new Error(
            "FRONTEND_URL debe utilizar HTTPS."
        );
    }

    const base = url.href.replace(/\/$/, "");

    return {
        online: {
            success_url:
                `${base}/pages/pago/exitoso.html`,

            failure_url:
                `${base}/pages/pago/rechazado.html`,

            pending_url:
                `${base}/pages/pago/pendiente.html`,

            auto_return: "all"
        }
    };
}

// =====================================================
// 9. RUTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {
    return res.json({
        mensaje: "Backend de Essenzia funcionando",

        mercadoPago:
            "Checkout Pro - Orders API",

        autenticacion:
            "Registro y sesiones con SQLite",

        productos:
            "Catálogo conectado a SQLite",

        inventario:
            "Inventario conectado a SQLite",

        pedidos:
            "Persistencia de pedidos en SQLite",

        entorno: "TEST"
    });
});

// =====================================================
// 10. CREAR ORDEN DE MERCADO PAGO
// POST /api/pagos/crear
// =====================================================

app.post("/api/pagos/crear", async (req, res) => {
    try {
        const { productos } = req.body || {};

        // =================================================
        // VALIDAR CARRITO
        // =================================================

        if (
            !Array.isArray(productos) ||
            productos.length === 0 ||
            productos.length > 30
        ) {
            return res.status(400).json({
                error: "El carrito no es válido."
            });
        }

        const idsRecibidos = new Set();

        // Productos que se enviarán a Mercado Pago.
        const items = [];

        // Productos que se guardarán en SQLite.
        const detallesPedido = [];

        // =================================================
        // VALIDAR PRODUCTOS Y STOCK
        // =================================================

        for (const producto of productos) {
            if (
                !producto ||
                !/^[1-9]\d*$/.test(
                    String(producto.id)
                ) ||
                !Number.isSafeInteger(
                    producto.cantidad
                ) ||
                producto.cantidad < 1 ||
                producto.cantidad > 20
            ) {
                return res.status(400).json({
                    error:
                        "Hay productos o cantidades inválidas."
                });
            }

            const id = Number(producto.id);

            // Evitar productos duplicados.
            if (idsRecibidos.has(id)) {
                return res.status(400).json({
                    error:
                        "Hay productos duplicados."
                });
            }

            idsRecibidos.add(id);

            // Consultar producto real desde SQLite.
            const perfume = obtenerProducto(id);

            if (!perfume) {
                return res.status(400).json({
                    error:
                        `El producto ${id} no existe, ` +
                        "está desactivado o tiene un precio inválido."
                });
            }

            // =================================================
            // COMPROBAR EXISTENCIAS
            // =================================================

            if (
                !Number.isSafeInteger(perfume.stock) ||
                perfume.stock < producto.cantidad
            ) {
                return res.status(409).json({
                    error:
                        `No hay stock suficiente de ` +
                        `${perfume.nombre}.`,

                    productoId: perfume.id,

                    stockDisponible:
                        perfume.stock
                });
            }

            // =================================================
            // ITEMS DE MERCADO PAGO
            // =================================================

            items.push({
                title:
                    `${perfume.marca} - ${perfume.nombre}`,

                quantity: producto.cantidad,

                unit_price: String(
                    perfume.precio
                )
            });

            // =================================================
            // DETALLES PARA SQLITE
            // =================================================

            detallesPedido.push({
                id: perfume.id,

                nombre: perfume.nombre,

                marca: perfume.marca,

                cantidad: producto.cantidad,

                precio: perfume.precio
            });
        }

        // =================================================
        // CALCULAR TOTAL
        // =================================================

        const total = items.reduce(
            (acumulado, item) => {
                return (
                    acumulado +
                    Number(item.unit_price) *
                    item.quantity
                );
            },
            0
        );

        if (
            !Number.isSafeInteger(total) ||
            total <= 0
        ) {
            return res.status(400).json({
                error: "El total no es válido."
            });
        }

        // =================================================
        // CREAR REFERENCIA ÚNICA
        // =================================================

        const referencia =
            `ESSENZIA-${randomUUID()}`;

        // =================================================
        // REGISTRAR PEDIDO EN SQLITE
        // =================================================

        const pedidoId = crearPedido({
            referencia,
            total,
            productos: detallesPedido
        });

        console.log(
            "Pedido registrado en SQLite:",
            pedidoId
        );

        // =================================================
        // PREPARAR ORDEN DE MERCADO PAGO
        // =================================================

        const orden = {
            type: "online",

            processing_mode: "manual",

            total_amount: String(total),

            external_reference: referencia,

            description:
                "Compra en Essenzia Perfumería",

            items
        };

        // Agregar URLs de retorno si están configuradas.
        const configuracion =
            obtenerConfiguracionRetorno();

        if (configuracion) {
            orden.config = configuracion;
        }

        // =================================================
        // SOLICITAR ORDEN A MERCADO PAGO
        // =================================================

        const respuesta = await fetch(
            "https://api.mercadopago.com/v1/orders",
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${MP_ACCESS_TOKEN}`,

                    "Content-Type":
                        "application/json",

                    Accept:
                        "application/json",

                    "X-Idempotency-Key":
                        randomUUID()
                },

                body: JSON.stringify(orden),

                signal: AbortSignal.timeout(15000)
            }
        );

        const datos = await respuesta.json();

        // =================================================
        // VALIDAR RESPUESTA DE MERCADO PAGO
        // =================================================

        if (!respuesta.ok) {
            console.error(
                "Error Mercado Pago:",
                JSON.stringify(datos)
            );

            return res.status(502).json({
                error:
                    "No se pudo crear la orden en Mercado Pago."
            });
        }

        if (
            !datos.id ||
            !datos.checkout_url
        ) {
            return res.status(502).json({
                error:
                    "Mercado Pago devolvió una respuesta incompleta."
            });
        }

        // =================================================
        // ASOCIAR ORDEN CON SQLITE
        // =================================================

        asociarOrdenMercadoPago(
            pedidoId,
            String(datos.id)
        );

        console.log(
            "Orden de Mercado Pago asociada:",
            datos.id
        );

        console.log(
            "Pedido SQLite:",
            pedidoId
        );

        console.log(
            "Total:",
            total,
            "CLP"
        );

        // =================================================
        // RESPONDER AL FRONTEND
        // =================================================

        return res.status(201).json({
            mensaje:
                "Orden creada correctamente.",

            pedidoId,

            orderId: datos.id,

            checkoutUrl:
                datos.checkout_url,

            total,

            referencia
        });

    } catch (error) {
        console.error(
            "Error al crear orden:",
            error
        );

        return res.status(500).json({
            error:
                "Error interno al crear la orden."
        });
    }
});

// =====================================================
// 11. CONSULTAR ESTADO DE UNA ORDEN
// GET /api/pagos/orden/:orderId
// =====================================================

app.get("/api/pagos/orden/:orderId", async (req, res) => {
    try {
        const resultado =
            await verificarOrdenMercadoPago(
                req.params.orderId
            );

        return res.json(resultado);

    } catch (error) {
        console.error(
            "Error verificando orden:",
            error
        );

        return res.status(
            error.codigoHTTP || 500
        ).json({
            error: error.codigoHTTP
                ? error.message
                : "Error interno al verificar el pago."
        });
    }
});

// =====================================================
// 12. INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
    console.log(
        "================================="
    );

    console.log(
        " ESSENZIA - BACKEND INICIADO"
    );

    console.log(
        ` http://localhost:${PORT}`
    );

    console.log(
        " Mercado Pago: Orders API"
    );

    console.log(
        " Entorno: TEST"
    );

    console.log(
        " Autenticación: SQLite"
    );

    console.log(
        " Productos: SQLite"
    );

    console.log(
        " Inventario: SQLite"
    );

    console.log(
        " Pedidos: SQLite"
    );

    console.log(
        "================================="
    );
});
