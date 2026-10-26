
const API_URL = "http://127.0.0.1:8000";
const token = sessionStorage.getItem("token");

const tabla = document.getElementById("tablaProductos");
const mensaje = document.getElementById("mensaje");
const mensajeModal = document.getElementById("mensajeModal");
const formulario = document.getElementById("formProducto");
const btnGuardar = document.getElementById("btnGuardar");
const tituloModal = document.getElementById("tituloModal");

const elementoModal = document.getElementById("modalProducto");
const modalProducto = new bootstrap.Modal(elementoModal);

let productosRegistrados = [];


// ==========================================
// 1. VERIFICAR AUTENTICACION
// ==========================================

if (!token) {
    window.location.replace("index.html");
} else {
    cargarProductos();
}


// ==========================================
// 2. CERRAR SESION
// ==========================================

document.getElementById("btnCerrarSesion")
    .addEventListener("click", cerrarSesion);

function cerrarSesion() {
    sessionStorage.removeItem("token");
    window.location.replace("index.html");
}


// ==========================================
// 3. MOSTRAR MENSAJES
// ==========================================

function mostrarMensaje(texto, tipo = "danger") {
    mensaje.textContent = texto;
    mensaje.className = `alert alert-${tipo}`;
}

function mostrarErrorModal(texto) {
    mensajeModal.textContent = texto;
    mensajeModal.classList.remove("d-none");
}

function limpiarMensajes() {
    mensaje.className = "alert d-none";
    mensaje.textContent = "";

    mensajeModal.className = "alert alert-danger d-none";
    mensajeModal.textContent = "";
}


// ==========================================
// 4. CREAR CELDAS
// ==========================================

function crearCelda(fila, valor) {
    const celda = document.createElement("td");
    celda.textContent = valor ?? "";
    fila.appendChild(celda);
    return celda;
}


// ==========================================
// 5. CONSULTAR PRODUCTOS
// ==========================================

async function cargarProductos() {
    try {
        const respuesta = await fetch(
            `${API_URL}/api/v1/productos/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (respuesta.status === 401) {
            cerrarSesion();
            return;
        }

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los productos");
        }

        productosRegistrados = await respuesta.json();

        tabla.innerHTML = "";

        if (productosRegistrados.length === 0) {
            const fila = document.createElement("tr");
            const celda = crearCelda(
                fila,
                "No existen productos registrados."
            );

            celda.colSpan = 7;
            celda.className = "text-center";

            tabla.appendChild(fila);
            return;
        }

        productosRegistrados.forEach(producto => {
            const fila = document.createElement("tr");

            crearCelda(fila, producto.id_producto);
            crearCelda(fila, producto.codigo);
            crearCelda(fila, producto.nombre_producto);
            crearCelda(fila, producto.precio_venta);
            crearCelda(fila, producto.precio_compra);

            const celdaEstado = crearCelda(
                fila,
                producto.estado ? "Activo" : "Inactivo"
            );

            celdaEstado.className = producto.estado
                ? "text-success"
                : "text-danger";

            const celdaAcciones = document.createElement("td");

            const btnEditar = document.createElement("button");
            btnEditar.type = "button";
            btnEditar.className = "btn btn-warning btn-sm";
            btnEditar.textContent = "Editar";

            btnEditar.addEventListener("click", () => {
                editarProducto(producto.id_producto);
            });

            celdaAcciones.appendChild(btnEditar);
            fila.appendChild(celdaAcciones);

            tabla.appendChild(fila);
        });

    } catch (error) {
        mostrarMensaje(error.message);
    }
}


// ==========================================
// 6. ABRIR FORMULARIO NUEVO PRODUCTO
// ==========================================

document.getElementById("btnNuevoProducto")
    .addEventListener("click", nuevoProducto);

function nuevoProducto() {
    formulario.reset();
    limpiarMensajes();

    document.getElementById("id_producto").value = "";

    document.getElementById("id_marca").value = 1;
    document.getElementById("id_categoria").value = 1;
    document.getElementById("id_unidad").value = 1;

    tituloModal.textContent = "Registrar Producto";
    btnGuardar.textContent = "Guardar Producto";

    modalProducto.show();
}


// ==========================================
// 7. ABRIR FORMULARIO PARA EDITAR
// ==========================================

function editarProducto(idProducto) {
    const producto = productosRegistrados.find(
        item => item.id_producto === idProducto
    );

    if (!producto) {
        mostrarMensaje("Producto no encontrado.");
        return;
    }

    formulario.reset();
    limpiarMensajes();

    document.getElementById("id_producto").value =
        producto.id_producto;

    document.getElementById("codigo").value =
        producto.codigo ?? "";

    document.getElementById("nombre_producto").value =
        producto.nombre_producto ?? "";

    document.getElementById("descripcion").value =
        producto.descripcion ?? "";

    document.getElementById("id_marca").value =
        producto.id_marca;

    document.getElementById("id_categoria").value =
        producto.id_categoria;

    document.getElementById("id_unidad").value =
        producto.id_unidad_de_medida;

    document.getElementById("precio_compra").value =
        producto.precio_compra;

    document.getElementById("precio_venta").value =
        producto.precio_venta;

    document.getElementById("costo_promedio").value =
        producto.costo_promedio;

    tituloModal.textContent = "Editar Producto";
    btnGuardar.textContent = "Guardar Cambios";

    modalProducto.show();
}


// ==========================================
// 8. OBTENER DATOS DEL FORMULARIO
// ==========================================

function obtenerDatosFormulario() {
    return {
        codigo: document.getElementById("codigo").value.trim(),

        nombre_producto: document.getElementById(
            "nombre_producto"
        ).value.trim(),

        descripcion: document.getElementById(
            "descripcion"
        ).value.trim(),

        id_marca: Number(
            document.getElementById("id_marca").value
        ),

        id_categoria: Number(
            document.getElementById("id_categoria").value
        ),

        id_unidad_de_medida: Number(
            document.getElementById("id_unidad").value
        ),

        precio_compra: Number(
            document.getElementById("precio_compra").value
        ),

        precio_venta: Number(
            document.getElementById("precio_venta").value
        ),

        costo_promedio: Number(
            document.getElementById("costo_promedio").value
        )
    };
}


// ==========================================
// 9. REGISTRAR O ACTUALIZAR PRODUCTO
// ==========================================

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    limpiarMensajes();

    const idProducto = document.getElementById(
        "id_producto"
    ).value;

    const esEdicion = idProducto !== "";

    const datos = obtenerDatosFormulario();

    const url = esEdicion
        ? `${API_URL}/api/v1/productos/${idProducto}`
        : `${API_URL}/api/v1/productos/`;

    const metodo = esEdicion ? "PUT" : "POST";

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Guardando...";

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (respuesta.status === 401) {
            cerrarSesion();
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            let detalle = "No se pudo guardar el producto";

            if (typeof resultado.detail === "string") {
                detalle = resultado.detail;
            } else if (Array.isArray(resultado.detail)) {
                detalle = resultado.detail.map(
                    error => error.msg
                ).join("; ");
            }

            throw new Error(detalle);
        }

        modalProducto.hide();
        formulario.reset();

        await cargarProductos();

        mostrarMensaje(
            esEdicion
                ? "Producto actualizado correctamente."
                : "Producto registrado correctamente.",
            "success"
        );

    } catch (error) {
        mostrarErrorModal(error.message);

    } finally {
        btnGuardar.disabled = false;

        btnGuardar.textContent = esEdicion
            ? "Guardar Cambios"
            : "Guardar Producto";
    }
});
