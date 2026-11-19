
const express = require("express");
const argon2 = require("argon2");
const { randomBytes, createHash } = require("node:crypto");
const { db } = require("../db/conexion.js");

const router = express.Router();

const COOKIE_NAME = "essenzia_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hashToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

function cookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };
}

function obtenerCookie(req, nombre) {
    const cookies = (req.headers.cookie || "").split(";");

    for (const cookie of cookies) {
        const indice = cookie.indexOf("=");

        if (indice === -1) continue;

        const clave = cookie.slice(0, indice).trim();
        const valor = cookie.slice(indice + 1).trim();

        if (clave === nombre) return valor;
    }

    return null;
}

function usuarioPublico(usuario) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        emailVerificado: Boolean(usuario.email_verificado)
    };
}

function obtenerUsuarioAutenticado(req) {
    const token = obtenerCookie(req, COOKIE_NAME);

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
        return null;
    }

    return db.prepare(`
        SELECT
            u.id,
            u.nombre,
            u.email,
            u.rol,
            u.email_verificado
        FROM sesiones AS s
        JOIN usuarios AS u
            ON u.id = s.usuario_id
        WHERE s.token_hash = ?
          AND s.revocado_en IS NULL
          AND s.expira_en > ?
          AND u.activo = 1
    `).get(
        hashToken(token),
        new Date().toISOString()
    ) || null;
}


 // ================================================
 // MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
 // ================================================

 function requerirAutenticacion(req, res, next) {
     try {
         const usuario = obtenerUsuarioAutenticado(req);

         if (!usuario) {
             return res.status(401).json({
                 error: "Debes iniciar sesión para continuar."
             });
         }

         req.usuario = usuario;
         next();

     } catch (error) {
         console.error("Error de autenticación:", error);

         return res.status(500).json({
             error: "No se pudo verificar la sesión."
         });
     }
 }

 function requerirAdministrador(req, res, next) {
     if (!req.usuario) {
         return res.status(401).json({
             error: "Debes iniciar sesión."
         });
     }

     if (req.usuario.rol !== "admin") {
         return res.status(403).json({
             error: "No tienes permisos de administrador."
         });
     }

     next();
 }


// REGISTRO DE USUARIOS
router.post("/registro", async (req, res) => {
    try {
        const {
            nombre,
            email,
            password,
            confirmar
        } = req.body || {};

        if (
            typeof nombre !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmar !== "string"
        ) {
            return res.status(400).json({
                error: "Completa todos los campos."
            });
        }

        const nombreLimpio = nombre.trim();
        const emailLimpio = email.trim().toLowerCase();

        if (
            nombreLimpio.length < 2 ||
            nombreLimpio.length > 100
        ) {
            return res.status(400).json({
                error: "El nombre debe tener entre 2 y 100 caracteres."
            });
        }

        if (
            emailLimpio.length > 254 ||
            !EMAIL_REGEX.test(emailLimpio)
        ) {
            return res.status(400).json({
                error: "Ingresa un correo electrónico válido."
            });
        }

        if (
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 1024
        ) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 12 caracteres."
            });
        }

        if (password !== confirmar) {
            return res.status(400).json({
                error: "Las contraseñas no coinciden."
            });
        }

        const existente = db.prepare(`
            SELECT id
            FROM usuarios
            WHERE email = ?
        `).get(emailLimpio);

        if (existente) {
            return res.status(409).json({
                error: "Este correo ya está registrado."
            });
        }

        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id
        });

        const resultado = db.prepare(`
            INSERT INTO usuarios (
                nombre,
                email,
                password_hash,
                rol,
                email_verificado
            )
            VALUES (?, ?, ?, 'cliente', 0)
        `).run(
            nombreLimpio,
            emailLimpio,
            passwordHash
        );

        return res.status(201).json({
            mensaje: "Cuenta creada correctamente.",
            usuario: {
                id: Number(resultado.lastInsertRowid),
                nombre: nombreLimpio,
                email: emailLimpio,
                rol: "cliente",
                emailVerificado: false
            }
        });

    } catch (error) {
        if (
            error.code === "SQLITE_CONSTRAINT_UNIQUE" ||
            String(error.message).includes("UNIQUE constraint failed")
        ) {
            return res.status(409).json({
                error: "Este correo ya está registrado."
            });
        }

        console.error("Error en registro:", error);

        return res.status(500).json({
            error: "No se pudo registrar el usuario."
        });
    }
});

// INICIO DE SESIÓN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res.status(400).json({
                error: "Ingresa tu correo y contraseña."
            });
        }

        const emailLimpio = email.trim().toLowerCase();

        if (
            emailLimpio.length > 254 ||
            !EMAIL_REGEX.test(emailLimpio) ||
            !password ||
            Buffer.byteLength(password, "utf8") > 1024
        ) {
            return res.status(400).json({
                error: "Credenciales inválidas."
            });
        }

        const usuario = db.prepare(`
            SELECT *
            FROM usuarios
            WHERE email = ?
        `).get(emailLimpio);

        if (!usuario || usuario.activo !== 1) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });
        }

        const passwordCorrecta = await argon2.verify(
            usuario.password_hash,
            password
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                error: "Correo o contraseña incorrectos."
            });
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = hashToken(token);

        const expiracion = new Date(
            Date.now() + SESSION_MS
        ).toISOString();

        db.prepare(`
            INSERT INTO sesiones (
                usuario_id,
                token_hash,
                expira_en
            )
            VALUES (?, ?, ?)
        `).run(
            usuario.id,
            tokenHash,
            expiracion
        );

        res.cookie(COOKIE_NAME, token, {
            ...cookieOptions(),
            maxAge: SESSION_MS
        });

        return res.json({
            mensaje: "Inicio de sesión exitoso.",
            usuario: usuarioPublico(usuario)
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            error: "No se pudo iniciar sesión."
        });
    }
});

// CONSULTAR USUARIO AUTENTICADO
router.get("/me", (req, res) => {
    try {
        const usuario = obtenerUsuarioAutenticado(req);

        if (!usuario) {
            return res.status(401).json({
                error: "No hay una sesión activa."
            });
        }

        return res.json({
            usuario: usuarioPublico(usuario)
        });

    } catch (error) {
        console.error("Error consultando sesión:", error);

        return res.status(500).json({
            error: "No se pudo consultar la sesión."
        });
    }
});

// CERRAR SESIÓN
router.post("/logout", (req, res) => {
    try {
        const token = obtenerCookie(req, COOKIE_NAME);

        if (token && /^[a-f0-9]{64}$/.test(token)) {
            db.prepare(`
                UPDATE sesiones
                SET revocado_en = ?
                WHERE token_hash = ?
                  AND revocado_en IS NULL
            `).run(
                new Date().toISOString(),
                hashToken(token)
            );
        }

        res.clearCookie(COOKIE_NAME, cookieOptions());

        return res.json({
            mensaje: "Sesión cerrada correctamente."
        });

    } catch (error) {
        console.error("Error cerrando sesión:", error);

        return res.status(500).json({
            error: "No se pudo cerrar la sesión."
        });
    }
});


 // ================================================
 // RUTA ADMINISTRATIVA PROTEGIDA
 // ================================================

 router.get(
     "/admin/verificar",
     requerirAutenticacion,
     requerirAdministrador,
     (req, res) => {
         return res.json({
             mensaje: "Acceso administrativo autorizado.",
             usuario: usuarioPublico(req.usuario)
         });
     }
 );


module.exports = router;

module.exports.requerirAutenticacion = requerirAutenticacion;
module.exports.requerirAdministrador = requerirAdministrador;
