
const API_URL = "http://localhost:3000";

export async function obtenerSesion() {
    try {
        const respuesta = await fetch(`${API_URL}/api/auth/me`, {
            credentials: "include",
            cache: "no-store"
        });

        if (!respuesta.ok) return null;

        const datos = await respuesta.json();
        return datos.usuario || null;

    } catch (error) {
        console.error("No se pudo consultar la sesión:", error);
        return null;
    }
}

export async function cerrarSesion() {
    const respuesta = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo cerrar la sesión.");
    }

    return true;
}
