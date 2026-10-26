import { useEffect, useState } from "react";

const API_URL = "https://ferreteria-cruz-tarea5.onrender.com";

const formularioInicial = {
  id_cliente: "",
  numero_venta: "",
  total: "",
  estado: "BORRADOR",
};

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);
  const [formulario, setFormulario] = useState({ ...formularioInicial });
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function consultarAPI(ruta, opciones = {}) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("No existe una sesión activa.");
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
        "No se pudo conectar con FastAPI. Verifica que el backend esté funcionando."
      );
    }

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
      let detalle = `Error ${respuesta.status}`;

      if (typeof resultado?.detail === "string") {
        detalle = resultado.detail;
      } else if (Array.isArray(resultado?.detail)) {
        detalle = resultado.detail.map((item) => item.msg).join("; ");
      }

      if (respuesta.status === 401) {
        detalle = "La sesión ha expirado. Ingresa nuevamente.";
      }

      throw new Error(detalle);
    }

    return resultado;
  }

  async function cargarVentas() {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarAPI("/api/v1/ventas/");

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de ventas.");
      }

      setVentas(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarVentas();
  }, []);

  function abrirNuevo() {
    setVentaEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(venta) {
    setVentaEditar(venta);

    setFormulario({
      id_cliente: String(venta.id_cliente ?? ""),
      numero_venta: venta.numero_venta ?? "",
      total: String(venta.total ?? ""),
      estado: venta.estado ?? "BORRADOR",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setVentaEditar(null);
    setError("");
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarVenta(evento) {
    evento.preventDefault();
    setError("");

    const esEdicion = ventaEditar !== null;

    if (!formulario.numero_venta.trim()) {
      setError("Debes ingresar el número de venta.");
      return;
    }

    if (!esEdicion) {
      if (
        formulario.id_cliente !== "" &&
        (!Number.isInteger(Number(formulario.id_cliente)) ||
          Number(formulario.id_cliente) <= 0)
      ) {
        setError("Debes ingresar un ID de cliente válido.");
        return;
      }

      if (
        formulario.total === "" ||
        !Number.isFinite(Number(formulario.total)) ||
        Number(formulario.total) < 0
      ) {
        setError("Debes ingresar un total válido.");
        return;
      }
    }

    setGuardando(true);

    const datos = esEdicion
      ? {
          numero_venta: formulario.numero_venta.trim(),
          estado: formulario.estado.trim(),
        }
      : {
          id_cliente:
            formulario.id_cliente === ""
              ? null
              : Number(formulario.id_cliente),
          numero_venta: formulario.numero_venta.trim(),
          total: Number(formulario.total),
        };

    const ruta = esEdicion
      ? `/api/v1/ventas/${ventaEditar.id_venta}`
      : "/api/v1/ventas/";

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setVentaEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarVentas();

      setMensaje(
        esEdicion
          ? "Venta actualizada correctamente."
          : "Venta registrada correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const ventasFiltradas = ventas.filter((venta) => {
    const texto = [
      venta.id_venta,
      venta.numero_venta,
      venta.id_cliente,
      venta.estado,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  function mostrarTotal(valor) {
    const numero = Number(valor);

    return Number.isFinite(numero) ? numero.toFixed(2) : "—";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Ventas
          </h2>

          <p className="mt-2 text-slate-500">
            Registro, consulta y modificación de ventas.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nueva Venta
        </button>
      </div>

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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="buscarVenta"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Buscar venta
        </label>

        <input
          id="buscarVenta"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por número de venta, cliente o estado"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {cargando ? (
          <p className="text-slate-500">Cargando ventas...</p>
        ) : (
          <table className="w-full min-w-[750px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Número de venta</th>
                <th className="p-3">Cliente (ID)</th>
                <th className="p-3">Total (Bs)</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ventasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-5 text-center text-slate-500"
                  >
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((venta) => (
                  <tr
                    key={venta.id_venta}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">{venta.id_venta}</td>

                    <td className="p-3 font-medium">
                      {venta.numero_venta}
                    </td>

                    <td className="p-3">
                      {venta.id_cliente ?? "Sin cliente"}
                    </td>

                    <td className="p-3">
                      {mostrarTotal(venta.total)}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          venta.estado === "BORRADOR"
                            ? "font-medium text-amber-600"
                            : "font-medium text-blue-700"
                        }
                      >
                        {venta.estado ?? "—"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(venta)}
                        className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloVenta"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3
                id="tituloVenta"
                className="text-xl font-bold text-slate-800"
              >
                {ventaEditar ? "Editar Venta" : "Registrar Venta"}
              </h3>

              <button
                type="button"
                disabled={guardando}
                onClick={cerrarModal}
                aria-label="Cerrar formulario"
                className="text-2xl text-slate-500"
              >
                ×
              </button>
            </div>

            <form onSubmit={guardarVenta} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-100 p-4 text-red-700"
                >
                  {error}
                </div>
              )}

              {!ventaEditar && (
                <div>
                  <label
                    htmlFor="id_cliente"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ID del cliente (opcional)
                  </label>

                  <input
                    id="id_cliente"
                    name="id_cliente"
                    type="number"
                    min="1"
                    step="1"
                    value={formulario.id_cliente}
                    onChange={actualizarCampo}
                    placeholder="Dejar vacío si no se identifica al cliente"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Si introduces un ID, debe corresponder a un cliente
                    existente en la base de datos.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="numero_venta"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Número de venta
                </label>

                <input
                  id="numero_venta"
                  name="numero_venta"
                  type="text"
                  required
                  value={formulario.numero_venta}
                  onChange={actualizarCampo}
                  placeholder="Ejemplo: VENT002"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              {!ventaEditar && (
                <div>
                  <label
                    htmlFor="totalVenta"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Total de venta (Bs)
                  </label>

                  <input
                    id="totalVenta"
                    name="total"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formulario.total}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: 150.00"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
              )}

              {ventaEditar && (
                <div>
                  <label
                    htmlFor="estadoVenta"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Estado
                  </label>

                  <input
                    id="estadoVenta"
                    name="estado"
                    type="text"
                    required
                    value={formulario.estado}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    BORRADOR es un estado probado anteriormente.
                    Otros valores deben estar permitidos por la base de datos.
                  </p>
                </div>
              )}

              {ventaEditar && (
                <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                  El cliente y el total no pueden modificarse desde
                  este formulario porque el endpoint PUT solamente
                  acepta el número de venta y el estado.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
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
                    : ventaEditar
                      ? "Guardar Cambios"
                      : "Guardar Venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ventas;