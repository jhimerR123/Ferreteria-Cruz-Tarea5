
import { useEffect, useState } from "react";
import Producto3D from "./Producto3D";

const API_URL = "https://ferreteria-cruz-tarea5.onrender.com";

const formularioInicial = {
  codigo: "",
  nombre_producto: "",
  descripcion: "",
  id_marca: "1",
  id_categoria: "1",
  id_unidad_de_medida: "1",
  precio_compra: "",
  precio_venta: "",
  costo_promedio: "",
};

const campos = [
  {
    name: "codigo",
    label: "Código",
    type: "text",
  },
  {
    name: "nombre_producto",
    label: "Nombre del producto",
    type: "text",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "text",
    optional: true,
  },
  {
    name: "id_marca",
    label: "ID Marca",
    type: "number",
    min: 1,
  },
  {
    name: "id_categoria",
    label: "ID Categoría",
    type: "number",
    min: 1,
  },
  {
    name: "id_unidad_de_medida",
    label: "ID Unidad de medida",
    type: "number",
    min: 1,
  },
  {
    name: "precio_compra",
    label: "Precio compra",
    type: "number",
    min: 0,
    step: "0.01",
  },
  {
    name: "precio_venta",
    label: "Precio venta",
    type: "number",
    min: 0,
    step: "0.01",
  },
  {
    name: "costo_promedio",
    label: "Costo promedio",
    type: "number",
    min: 0,
    step: "0.0001",
  },
];

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);

  async function cargarProductos() {
    setCargando(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");

      const respuesta = await fetch(
        `${API_URL}/api/v1/productos/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          `No se pudieron cargar los productos. Error ${respuesta.status}`
        );
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de productos.");
      }

      setProductos(datos);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function abrirNuevo() {
    setProductoEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(producto) {
    setProductoEditar(producto);
    setError("");
    setMensaje("");

    setFormulario({
      codigo: producto.codigo ?? "",
      nombre_producto: producto.nombre_producto ?? "",
      descripcion: producto.descripcion ?? "",
      id_marca: String(producto.id_marca ?? 1),
      id_categoria: String(producto.id_categoria ?? 1),
      id_unidad_de_medida: String(
        producto.id_unidad_de_medida ?? 1
      ),
      precio_compra: String(producto.precio_compra ?? ""),
      precio_venta: String(producto.precio_venta ?? ""),
      costo_promedio: String(producto.costo_promedio ?? ""),
    });

    setModalAbierto(true);
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarProducto(evento) {
    evento.preventDefault();

    setGuardando(true);
    setError("");

    const token = sessionStorage.getItem("token");
    const esEdicion = productoEditar !== null;

    const datos = {
      codigo: formulario.codigo.trim(),
      nombre_producto: formulario.nombre_producto.trim(),
      descripcion: formulario.descripcion.trim(),
      id_marca: Number(formulario.id_marca),
      id_categoria: Number(formulario.id_categoria),
      id_unidad_de_medida: Number(
        formulario.id_unidad_de_medida
      ),
      precio_compra: Number(formulario.precio_compra),
      precio_venta: Number(formulario.precio_venta),
      costo_promedio: Number(formulario.costo_promedio),
    };

    const url = esEdicion
      ? `${API_URL}/api/v1/productos/${productoEditar.id_producto}`
      : `${API_URL}/api/v1/productos/`;

    try {
      const respuesta = await fetch(url, {
        method: esEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        let detalle = "No se pudo guardar el producto";

        if (typeof resultado.detail === "string") {
          detalle = resultado.detail;
        } else if (Array.isArray(resultado.detail)) {
          detalle = resultado.detail
            .map((item) => item.msg)
            .join("; ");
        }

        throw new Error(detalle);
      }

      setModalAbierto(false);
      setProductoEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarProductos();

      setMensaje(
        esEdicion
          ? "Producto actualizado correctamente."
          : "Producto registrado correctamente."
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* ENCABEZADO */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Productos
          </h2>

          <p className="mt-2 text-slate-500">
            Registro, consulta y modificación de productos.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nuevo Producto
        </button>
      </div>

      {/* MENSAJES */}
      {mensaje && (
        <div
          role="status"
          className="rounded-lg bg-green-100 p-4 text-green-800"
        >
          {mensaje}
        </div>
      )}

      {error && !modalAbierto && (
        <div
          role="alert"
          className="rounded-lg bg-red-100 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {/* TABLA */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        {cargando ? (
          <p className="text-slate-500">
            Cargando productos...
          </p>
        ) : (
          <table className="w-full border-collapse text-left">

            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Código</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Precio compra</th>
                <th className="p-3">Precio venta</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-5 text-center text-slate-500"
                  >
                    No existen productos registrados.
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr
                    key={producto.id_producto}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {producto.id_producto}
                    </td>

                    <td className="p-3">
                      {producto.codigo}
                    </td>

                    <td className="p-3">
                      {producto.nombre_producto}
                    </td>

                    <td className="p-3">
                      {producto.precio_compra}
                    </td>

                    <td className="p-3">
                      {producto.precio_venta}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          producto.estado
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {producto.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(producto)}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        )}
      </div>

      {/* VISOR 3D */}
      <Producto3D />

      {/* FORMULARIO EMERGENTE */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloFormulario"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <h3
                id="tituloFormulario"
                className="text-xl font-bold text-slate-800"
              >
                {productoEditar
                  ? "Editar Producto"
                  : "Registrar Producto"}
              </h3>

              <button
                type="button"
                disabled={guardando}
                onClick={() => setModalAbierto(false)}
                className="text-2xl text-slate-500 hover:text-slate-900"
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarProducto} className="p-6">

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-lg bg-red-100 p-4 text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {campos.map((campo) => (
                  <div key={campo.name}>

                    <label
                      htmlFor={campo.name}
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      {campo.label}
                    </label>

                    <input
                      id={campo.name}
                      name={campo.name}
                      type={campo.type}
                      value={formulario[campo.name]}
                      onChange={actualizarCampo}
                      required={!campo.optional}
                      min={campo.min}
                      step={campo.step}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

              </div>

              <div className="mt-8 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setModalAbierto(false)}
                  className="rounded-lg bg-slate-200 px-5 py-3 text-slate-700 hover:bg-slate-300"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {guardando
                    ? "Guardando..."
                    : productoEditar
                      ? "Guardar Cambios"
                      : "Guardar Producto"}
                </button>

              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Productos;
