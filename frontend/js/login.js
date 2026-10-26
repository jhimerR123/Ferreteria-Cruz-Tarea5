
const API_URL = "http://127.0.0.1:8000";

const formLogin = document.getElementById("formLogin");
const mensaje = document.getElementById("mensaje");
const btnIngresar = document.getElementById("btnIngresar");

formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const clave = document.getElementById("clave").value;

    mensaje.classList.add("d-none");
    btnIngresar.disabled = true;
    btnIngresar.textContent = "Verificando...";

    try {
        const datos = new URLSearchParams();
        datos.append("username", usuario);
        datos.append("password", clave);

        const respuesta = await fetch(
            `${API_URL}/api/v1/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: datos
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                typeof resultado.detail === "string"
                    ? resultado.detail
                    : "Usuario o contraseña incorrectos"
            );
        }

        if (!resultado.access_token) {
            throw new Error("No se recibió el token de acceso");
        }

        sessionStorage.setItem(
            "token",
            resultado.access_token
        );

        window.location.href = "dashboard.html";

    } catch (error) {
        mensaje.textContent = error.message;
        mensaje.classList.remove("d-none");

    } finally {
        btnIngresar.disabled = false;
        btnIngresar.textContent = "Ingresar al Sistema";
    }
});
