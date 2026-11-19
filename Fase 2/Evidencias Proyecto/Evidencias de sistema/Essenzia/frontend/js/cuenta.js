
/* ==============================================
   ESSENZIA - MI CUENTA
   Archivo: frontend/js/cuenta.js
============================================== */

const $ = (selector) => document.querySelector(selector);

const paneles = [
    "resumen",
    "favoritos",
    "pedidos",
    "datos"
];

function mostrarPanel(nombre) {
    if (!paneles.includes(nombre)) {
        return;
    }

    paneles.forEach((panel) => {
        const seccion = $(`#panel-${panel}`);

        if (seccion) {
            seccion.hidden = panel !== nombre;
        }
    });

    document.querySelectorAll("[data-panel]").forEach(
        (boton) => {
            const activo = boton.dataset.panel === nombre;

            boton.classList.toggle("active", activo);
            boton.setAttribute(
                "aria-current",
                activo ? "page" : "false"
            );
        }
    );
}

function configurarNavegacion() {
    document.querySelectorAll("[data-panel]").forEach(
        (boton) => {
            boton.addEventListener("click", () => {
                mostrarPanel(boton.dataset.panel);
            });
        }
    );
}

function configurarPerfil() {
    // Todavía no existe autenticación real.
    // No se mostrarán datos personales ficticios.

    const nombre = $("#usuario-nombre");
    const email = $("#usuario-email");
    const inicial = $("#usuario-inicial");

    if (nombre) {
        nombre.textContent = "Invitado";
    }

    if (email) {
        email.textContent = "Sin sesión iniciada";
    }

    if (inicial) {
        inicial.textContent = "?";
    }
}

function configurarFavoritos() {
    const contenedor = $("#lista-favoritos");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="cuenta-vacio">
            <span>♡</span>

            <h3>Tu lista de deseos te espera</h3>

            <p>
                Inicia sesión para guardar tus
                perfumes favoritos y acceder a ellos
                cuando quieras.
            </p>

            <a
                href="../auth/login.html"
                class="cuenta-button"
            >
                Iniciar sesión
            </a>
        </div>
    `;
}

function iniciarCuenta() {
    configurarNavegacion();
    configurarPerfil();
    configurarFavoritos();

    mostrarPanel("resumen");
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarCuenta
    );
} else {
    iniciarCuenta();
}
