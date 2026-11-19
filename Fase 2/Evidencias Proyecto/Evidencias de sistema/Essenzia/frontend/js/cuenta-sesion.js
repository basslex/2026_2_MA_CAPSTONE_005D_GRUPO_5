
import { obtenerSesion, cerrarSesion } from "./sesion.js";

async function iniciarCuentaSesion() {
    const nombre = document.querySelector("#usuario-nombre");
    const email = document.querySelector("#usuario-email");
    const inicial = document.querySelector("#usuario-inicial");
    const acceso = document.querySelector("#cuenta-acceso");

    if (!nombre || !email || !inicial || !acceso) return;

    const usuario = await obtenerSesion();

    if (!usuario) {
        window.location.replace("../auth/login.html");
        return;
    }

    nombre.textContent = usuario.nombre;
    email.textContent = usuario.email;
    inicial.textContent = usuario.nombre.charAt(0).toUpperCase();

    acceso.textContent = "Cerrar sesión";
    acceso.href = "#cerrar-sesion";

    acceso.addEventListener("click", async (evento) => {
        evento.preventDefault();

        acceso.style.pointerEvents = "none";
        acceso.textContent = "Cerrando sesión...";

        try {
            await cerrarSesion();
            window.location.replace("../../index.html");
        } catch (error) {
            console.error(error);
            acceso.textContent = "Cerrar sesión";
            acceso.style.pointerEvents = "";
            alert("No se pudo cerrar la sesión. Inténtalo nuevamente.");
        }
    });

    if (usuario.rol === "admin") {
        const menu = document.querySelector(".cuenta-menu");

        if (menu && !document.querySelector("#enlace-admin")) {
            const enlace = document.createElement("a");
            enlace.id = "enlace-admin";
            enlace.className = "menu-item";
            enlace.href = "../admin/dashboard.html";
            enlace.textContent = "◈ Panel administrativo";
            menu.appendChild(enlace);
        }
    }
}

iniciarCuentaSesion();
