
const API_URL = "http://localhost:3000";

function $(selector) {
    return document.querySelector(selector);
}

function mostrarMensaje(mensaje, tipo = "error") {
    const elemento = $("#auth-message");

    if (!elemento) return;

    elemento.textContent = mensaje;
    elemento.className = `auth-message ${tipo}`;
}

async function solicitarAPI(ruta, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers
        }
    });

    const datos = await respuesta.json();

    return { respuesta, datos };
}

// FORMULARIO DE REGISTRO
function configurarRegistro() {
    const formulario = $("#registro-form");

    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!formulario.reportValidity()) return;

        const nombre = $("#registro-nombre").value.trim();
        const email = $("#registro-email").value.trim();
        const password = $("#registro-password").value;
        const confirmar = $("#registro-confirmar").value;

        if (password !== confirmar) {
            mostrarMensaje("Las contraseñas no coinciden.");
            return;
        }

        if (password.length < 12) {
            mostrarMensaje(
                "La contraseña debe tener al menos 12 caracteres."
            );
            return;
        }

        const boton = formulario.querySelector(
            'button[type="submit"]'
        );

        if (boton) boton.disabled = true;

        mostrarMensaje("Creando tu cuenta...", "success");

        try {
            const { respuesta, datos } = await solicitarAPI(
                "/api/auth/registro",
                {
                    method: "POST",
                    body: JSON.stringify({
                        nombre,
                        email,
                        password,
                        confirmar
                    })
                }
            );

            if (!respuesta.ok) {
                mostrarMensaje(
                    datos.error || "No se pudo crear la cuenta."
                );
                return;
            }

            mostrarMensaje(
                "¡Cuenta creada correctamente! Ya puedes iniciar sesión.",
                "success"
            );

            formulario.reset();

        } catch (error) {
            console.error("Error de registro:", error);

            mostrarMensaje(
                "No se pudo conectar con el backend."
            );

        } finally {
            if (boton) boton.disabled = false;
        }
    });
}

// FORMULARIO DE LOGIN
function configurarLogin() {
    const formulario = $("#login-form");

    if (!formulario) return;

    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        if (!formulario.reportValidity()) return;

        const email = $("#login-email").value.trim();
        const password = $("#login-password").value;

        const boton = formulario.querySelector(
            'button[type="submit"]'
        );

        if (boton) boton.disabled = true;

        mostrarMensaje("Verificando credenciales...", "success");

        try {
            const { respuesta, datos } = await solicitarAPI(
                "/api/auth/login",
                {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            if (!respuesta.ok) {
                mostrarMensaje(
                    datos.error || "No se pudo iniciar sesión."
                );
                return;
            }

            mostrarMensaje(
                `¡Bienvenido, ${datos.usuario.nombre}!`,
                "success"
            );

            window.location.href = "../../index.html";

        } catch (error) {
            console.error("Error de login:", error);

            mostrarMensaje(
                "No se pudo conectar con el backend."
            );

        } finally {
            if (boton) boton.disabled = false;
        }
    });
}

function iniciarAuth() {
    configurarRegistro();
    configurarLogin();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarAuth);
} else {
    iniciarAuth();
}
