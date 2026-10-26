import { useEffect, useState } from "react";

const API_URL = "https://ferreteria-cruz-tarea5.onrender.com";

const formularioInicial = {
  id_producto: "",
  id_ferreteria: "1",
  stock_actual: "",
  stock_minimo: "",
  ubicacion: "",
  pasillo: "",
  estante: "",
};

function Stock() {
  const [registros, setRegistros] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [formulario, setFormulario] = useState({
    ...formularioInicial,
  });
  const [busqueda, setBusqueda] = useState("");
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function consultarAPI(ruta, opciones = {}) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error(
        "No existe una sesión activa. Inicia sesión nuevamente."
      );
    }

    let respuesta;

    try {
      respuesta = await fetch(`${API_URL}${ruta}`, {
        ...opciones,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(opciones.body
            ? { "Content-Type": "application/json" }
            : {}),
          ...opciones.headers,
        },
      });
    } catch {
      throw new Error(
        "No se pudo conectar con FastAPI. Verifica que el backend esté encendido."
      );
    }

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      let detalle = `Error ${respuesta.status}`;

      if (typeof resultado?.detail === "string") {
        detalle = resultado.detail;
      } else if (Array.isArray(resultado?.detail)) {
        detalle = resultado.detail
          .map((item) => item.msg)
          .join("; ");
      }

      if (respuesta.status === 401) {
        detalle = "La sesión ha expirado. Inicia sesión nuevamente.";
      }

      throw new Error(detalle);
    }

    return resultado;
  }

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [datosStock, datosProductos] = await Promise.all([
        consultarAPI("/api/v1/stock/"),
        consultarAPI("/api/v1/productos/"),
      ]);

      if (!Array.isArray(datosStock)) {
        throw new Error(
          "El backend no devolvió una lista válida de stock."
        );
      }

      if (!Array.isArray(datosProductos)) {
        throw new Error(
          "El backend no devolvió una lista válida de productos."
        );
      }

      setRegistros(datosStock);
      setProductos(datosProductos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function nombreProducto(idProducto) {
    const producto = productos.find(
      (item) => Number(item.id_producto) === Number(idProducto)
    );

    return (
      producto?.nombre_producto ||
      producto?.nombre ||
      `Producto ID ${idProducto}`
    );
  }

  function codigoProducto(idProducto) {
    const producto = productos.find(
      (item) => Number(item.id_producto) === Number(idProducto)
    );

    return producto?.codigo_producto || producto?.codigo || "—";
  }

  function obtenerEstado(registro) {
    const actual = Number(registro.stock_actual);
    const minimo = Number(registro.stock_minimo);

    if (!Number.isFinite(actual) || !Number.isFinite(minimo)) {
      return "Sin datos";
    }

    if (actual <= 0) {
      return "Sin existencias";
    }

    if (actual < minimo) {
      return "Stock bajo";
    }

    return "Disponible";
  }

  const totalRegistros = registros.length;

  const totalAlertas = registros.filter(
    (registro) =>
      Number(registro.stock_actual) < Number(registro.stock_minimo)
  ).length;

  const totalAgotados = registros.filter(
    (registro) => Number(registro.stock_actual) <= 0
  ).length;

  const registrosFiltrados = registros.filter((registro) => {
    const texto = [
      registro.id_stock,
      registro.id_producto,
      nombreProducto(registro.id_producto),
      codigoProducto(registro.id_producto),
      registro.ubicacion,
      registro.pasillo,
      registro.estante,
    ]
      .join(" ")
      .toLowerCase();

    const coincideBusqueda = texto.includes(
      busqueda.trim().toLowerCase()
    );

    const coincideAlerta =
      !soloAlertas ||
      Number(registro.stock_actual) < Number(registro.stock_minimo);

    return coincideBusqueda && coincideAlerta;
  });

  function abrirNuevo() {
    setRegistroEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(registro) {
    setRegistroEditar(registro);

    setFormulario({
      id_producto: String(registro.id_producto ?? ""),
      id_ferreteria: String(registro.id_ferreteria ?? "1"),
      stock_actual: String(registro.stock_actual ?? "0"),
      stock_minimo: String(registro.stock_minimo ?? "0"),
      ubicacion: registro.ubicacion ?? "",
      pasillo: registro.pasillo ?? "",
      estante: registro.estante ?? "",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setRegistroEditar(null);
    setError("");
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function validarFormulario(esEdicion) {
    const actual = Number(formulario.stock_actual);
    const minimo = Number(formulario.stock_minimo);

    if (
      formulario.stock_actual === "" ||
      !Number.isInteger(actual) ||
      actual < 0
    ) {
      return "El stock actual debe ser un número entero igual o mayor que cero.";
    }

    if (
      formulario.stock_minimo === "" ||
      !Number.isInteger(minimo) ||
      minimo < 0
    ) {
      return "El stock mínimo debe ser un número entero igual o mayor que cero.";
    }

    if (!esEdicion) {
      const idProducto = Number(formulario.id_producto);
      const idFerreteria = Number(formulario.id_ferreteria);

      if (!Number.isInteger(idProducto) || idProducto <= 0) {
        return "Selecciona un producto válido.";
      }

      if (!Number.isInteger(idFerreteria) || idFerreteria <= 0) {
        return "Introduce un ID de ferretería válido.";
      }
    }

    return "";
  }

  async function guardarStock(evento) {
    evento.preventDefault();
    setError("");

    const esEdicion = registroEditar !== null;
    const errorValidacion = validarFormulario(esEdicion);

    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    const datosBase = {
      stock_actual: Number(formulario.stock_actual),
      stock_minimo: Number(formulario.stock_minimo),
      ubicacion: formulario.ubicacion.trim(),
      pasillo: formulario.pasillo.trim(),
      estante: formulario.estante.trim(),
    };

    const datos = esEdicion
      ? datosBase
      : {
          id_producto: Number(formulario.id_producto),
          id_ferreteria: Number(formulario.id_ferreteria),
          ...datosBase,
        };

    const ruta = esEdicion
      ? `/api/v1/stock/${registroEditar.id_stock}`
      : "/api/v1/stock/";

    setGuardando(true);

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setRegistroEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarDatos();

      setMensaje(
        esEdicion
          ? "Stock actualizado correctamente."
          : "Stock registrado correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Stock
          </h2>

          <p className="mt-2 text-slate-500">
            Control de existencias, ubicaciones y stock mínimo.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nuevo Stock
        </button>
      </div>

      {mensaje && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800">
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Registros de inventario
          </p>

          <h3 className="mt-3 text-3xl font-bold text-blue-800">
            {totalRegistros}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Registros bajo el mínimo
          </p>

          <h3 className="mt-3 text-3xl font-bold text-amber-600">
            {totalAlertas}
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Registros sin existencias
          </p>

          <h3 className="mt-3 text-3xl font-bold text-red-600">
            {totalAgotados}
          </h3>
        </div>
      </div>

      {totalAlertas > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h3 className="font-bold text-amber-800">
            Alerta de inventario
          </h3>

          <p className="mt-2 text-sm text-amber-700">
            Existen {totalAlertas} registros con existencias
            inferiores al stock mínimo establecido.
          </p>

          <button
            type="button"
            onClick={() => setSoloAlertas(true)}
            className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            Ver stock bajo
          </button>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="buscarStock"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Buscar en el inventario
        </label>

        <input
          id="buscarStock"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por producto, código o ubicación"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSoloAlertas(false)}
            className={`rounded-lg px-4 py-2 ${
              !soloAlertas
                ? "bg-blue-700 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            Todo el inventario
          </button>

          <button
            type="button"
            onClick={() => setSoloAlertas(true)}
            className={`rounded-lg px-4 py-2 ${
              soloAlertas
                ? "bg-amber-600 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            Stock bajo
          </button>

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Actualizar lista
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {cargando ? (
          <p className="text-slate-500">
            Cargando inventario...
          </p>
        ) : (
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Código</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Stock actual</th>
                <th className="p-3">Stock mínimo</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Pasillo</th>
                <th className="p-3">Estante</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="p-6 text-center text-slate-500"
                  >
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((registro) => {
                  const estado = obtenerEstado(registro);

                  return (
                    <tr
                      key={registro.id_stock}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-3">
                        {registro.id_stock}
                      </td>

                      <td className="p-3">
                        {codigoProducto(registro.id_producto)}
                      </td>

                      <td className="p-3 font-medium">
                        {nombreProducto(registro.id_producto)}
                      </td>

                      <td className="p-3 font-bold">
                        {registro.stock_actual}
                      </td>

                      <td className="p-3">
                        {registro.stock_minimo}
                      </td>

                      <td className="p-3">
                        {registro.ubicacion || "—"}
                      </td>

                      <td className="p-3">
                        {registro.pasillo || "—"}
                      </td>

                      <td className="p-3">
                        {registro.estante || "—"}
                      </td>

                      <td className="p-3">
                        <span
                          className={
                            estado === "Disponible"
                              ? "font-semibold text-green-700"
                              : estado === "Stock bajo"
                                ? "font-semibold text-amber-600"
                                : "font-semibold text-red-600"
                          }
                        >
                          {estado}
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => abrirEditar(registro)}
                          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloStock"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3
                id="tituloStock"
                className="text-xl font-bold text-slate-800"
              >
                {registroEditar
                  ? "Actualizar Stock"
                  : "Registrar Stock"}
              </h3>

              <button
                type="button"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar formulario"
                className="text-2xl text-slate-500"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={guardarStock}
              className="space-y-5 p-6"
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-100 p-4 text-red-700"
                >
                  {error}
                </div>
              )}

              {!registroEditar ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Producto
                    </label>

                    <select
                      name="id_producto"
                      required
                      value={formulario.id_producto}
                      onChange={actualizarCampo}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    >
                      <option value="">
                        Seleccionar producto
                      </option>

                      {productos.map((producto) => (
                        <option
                          key={producto.id_producto}
                          value={producto.id_producto}
                        >
                          {producto.nombre_producto ||
                            producto.nombre ||
                            `Producto ${producto.id_producto}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      ID de ferretería
                    </label>

                    <input
                      type="number"
                      name="id_ferreteria"
                      min="1"
                      step="1"
                      required
                      value={formulario.id_ferreteria}
                      onChange={actualizarCampo}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      El valor inicial es 1. Verifica que
                      corresponda a Ferretería Cruz en Supabase.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-slate-100 p-4">
                  <p className="text-sm text-slate-600">
                    Producto seleccionado:
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {nombreProducto(registroEditar.id_producto)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Stock actual
                  </label>

                  <input
                    type="number"
                    name="stock_actual"
                    min="0"
                    step="1"
                    required
                    value={formulario.stock_actual}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Stock mínimo
                  </label>

                  <input
                    type="number"
                    name="stock_minimo"
                    min="0"
                    step="1"
                    required
                    value={formulario.stock_minimo}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Ubicación
                </label>

                <input
                  type="text"
                  name="ubicacion"
                  value={formulario.ubicacion}
                  onChange={actualizarCampo}
                  placeholder="Ejemplo: Área de herramientas"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Pasillo
                  </label>

                  <input
                    type="text"
                    name="pasillo"
                    value={formulario.pasillo}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: A1"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estante
                  </label>

                  <input
                    type="text"
                    name="estante"
                    value={formulario.estante}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: E2"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={cerrarModal}
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
                    : registroEditar
                      ? "Guardar Cambios"
                      : "Registrar Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;