
import { obtenerSesion } from "./sesion.js";

async function configurarCuentaInicio() {
    const enlace = document.querySelector("#account-link");

    if (!enlace) return;

    const texto = enlace.querySelector("span");
    const usuario = await obtenerSesion();

    if (!usuario) {
        enlace.href = "./pages/auth/login.html";
        enlace.setAttribute(
            "aria-label",
            "Iniciar sesión en Essenzia"
        );

        if (texto) {
            texto.textContent = "Iniciar sesión";
        }

        return;
    }

    enlace.href = "./pages/cuenta/perfil.html";

    enlace.setAttribute(
        "aria-label",
        `Abrir cuenta de ${usuario.nombre}`
    );

    if (texto) {
        texto.textContent = usuario.nombre;
    }
}

configurarCuentaInicio();
