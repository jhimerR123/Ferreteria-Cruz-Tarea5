
const API_URL = "http://127.0.0.1:8000";

const token = sessionStorage.getItem("token");

if (!token) {
    window.location.replace("index.html");
} else {
    cargarPerfil();
}

async function cargarPerfil() {
    try {
        const respuesta = await fetch(
            `${API_URL}/api/v1/auth/mi-perfil`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (respuesta.status === 401) {
            cerrarSesion();
            return;
        }

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el perfil");
        }

        const usuario = await respuesta.json();

        document.getElementById("nombreUsuario").textContent =
            usuario.nombre_completo || usuario.usuario || "Usuario";

    } catch (error) {
        document.getElementById("nombreUsuario").textContent =
            "Error al cargar usuario";

        console.error(error);
    }
}

function cerrarSesion() {
    sessionStorage.removeItem("token");
    window.location.replace("index.html");
}

document.getElementById("btnCerrarSesion")
    .addEventListener("click", cerrarSesion);

// Los módulos se conectarán en los siguientes pasos.
document.querySelectorAll("[data-modulo]").forEach(enlace => {
    enlace.addEventListener("click", function(event) {
        event.preventDefault();

        const modulo = this.dataset.modulo;

        alert(
            `El módulo ${modulo} se conectará con FastAPI en el siguiente paso.`
        );
    });
});
