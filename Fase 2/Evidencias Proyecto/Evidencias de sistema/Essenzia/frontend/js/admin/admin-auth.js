
import { obtenerSesion } from "../sesion.js";

export async function verificarAdministrador() {
    const usuario = await obtenerSesion();

    if (!usuario) {
        window.location.replace("../auth/login.html");
        return false;
    }

    if (usuario.rol !== "admin") {
        alert("No tienes permisos para acceder al administrador.");
        window.location.replace("../../index.html");
        return false;
    }

    return true;
}
