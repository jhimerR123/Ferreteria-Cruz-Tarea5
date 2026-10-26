import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const formularioInicial = {
  id_proveedor: "",
  numero_compra: "",
  total: "",
  estado: "BORRADOR",
};

function Compras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [compraEditar, setCompraEditar] = useState(null);
  const [formulario, setFormulario] = useState({ ...formularioInicial });
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function consultarAPI(ruta, opciones = {}) {
    const token = sessionStorage.getItem("token");

    if (!token) {
      throw new Error("No existe una sesión activa.");
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opciones.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...opciones.headers,
      },
    });

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
        detalle = "La sesión ha expirado. Ingresa nuevamente.";
      }

      throw new Error(detalle);
    }

    return resultado;
  }

  async function cargarCompras() {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarAPI("/api/v1/compras/");

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de compras.");
      }

      setCompras(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCompras();
  }, []);

  function abrirNuevo() {
    setCompraEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(compra) {
    setCompraEditar(compra);

    setFormulario({
      id_proveedor: String(compra.id_proveedor ?? ""),
      numero_compra: compra.numero_compra ?? "",
      total: String(compra.total ?? ""),
      estado: compra.estado ?? "BORRADOR",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setCompraEditar(null);
    setError("");
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarCompra(evento) {
    evento.preventDefault();
    setError("");

    const esEdicion = compraEditar !== null;

    if (!formulario.numero_compra.trim()) {
      setError("Debes ingresar el número de compra.");
      return;
    }

    if (!esEdicion) {
      if (
        !Number.isInteger(Number(formulario.id_proveedor)) ||
        Number(formulario.id_proveedor) <= 0
      ) {
        setError("Debes ingresar un ID de proveedor válido.");
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
          numero_compra: formulario.numero_compra.trim(),
          estado: formulario.estado,
        }
      : {
          id_proveedor: Number(formulario.id_proveedor),
          numero_compra: formulario.numero_compra.trim(),
          total: Number(formulario.total),
        };

    const ruta = esEdicion
      ? `/api/v1/compras/${compraEditar.id_compra}`
      : "/api/v1/compras/";

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setCompraEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarCompras();

      setMensaje(
        esEdicion
          ? "Compra actualizada correctamente."
          : "Compra registrada correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const comprasFiltradas = compras.filter((compra) => {
    const texto = [
      compra.id_compra,
      compra.numero_compra,
      compra.id_proveedor,
      compra.estado,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  function mostrarTotal(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      return "—";
    }

    return numero.toFixed(2);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Compras
          </h2>

          <p className="mt-2 text-slate-500">
            Registro, consulta y modificación de compras.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nueva Compra
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
          htmlFor="buscarCompra"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Buscar compra
        </label>

        <input
          id="buscarCompra"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por número de compra, proveedor o estado"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {cargando ? (
          <p className="text-slate-500">Cargando compras...</p>
        ) : (
          <table className="w-full min-w-[750px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Número de compra</th>
                <th className="p-3">Proveedor (ID)</th>
                <th className="p-3">Total (Bs)</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {comprasFiltradas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-5 text-center text-slate-500"
                  >
                    No se encontraron compras.
                  </td>
                </tr>
              ) : (
                comprasFiltradas.map((compra) => (
                  <tr
                    key={compra.id_compra}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">{compra.id_compra}</td>

                    <td className="p-3 font-medium">
                      {compra.numero_compra}
                    </td>

                    <td className="p-3">
                      {compra.id_proveedor ?? "—"}
                    </td>

                    <td className="p-3">
                      {mostrarTotal(compra.total)}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          compra.estado === "BORRADOR"
                            ? "font-medium text-amber-600"
                            : "font-medium text-blue-700"
                        }
                      >
                        {compra.estado ?? "—"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(compra)}
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
            aria-labelledby="tituloCompra"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3
                id="tituloCompra"
                className="text-xl font-bold text-slate-800"
              >
                {compraEditar ? "Editar Compra" : "Registrar Compra"}
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

            <form onSubmit={guardarCompra} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-100 p-4 text-red-700"
                >
                  {error}
                </div>
              )}

              {!compraEditar && (
                <div>
                  <label
                    htmlFor="id_proveedor"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ID del proveedor
                  </label>

                  <input
                    id="id_proveedor"
                    name="id_proveedor"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={formulario.id_proveedor}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: 1"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Debes utilizar el ID de un proveedor que ya exista
                    en la base de datos.
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="numero_compra"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Número de compra
                </label>

                <input
                  id="numero_compra"
                  name="numero_compra"
                  type="text"
                  required
                  value={formulario.numero_compra}
                  onChange={actualizarCampo}
                  placeholder="Ejemplo: COMP002"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              {!compraEditar && (
                <div>
                  <label
                    htmlFor="total"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Total de compra (Bs)
                  </label>

                  <input
                    id="total"
                    name="total"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formulario.total}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: 300.00"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
              )}

              {compraEditar && (
                <div>
                  <label
                    htmlFor="estadoCompra"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Estado
                  </label>

                  <input
                    id="estadoCompra"
                    name="estado"
                    type="text"
                    required
                    value={formulario.estado}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    El valor BORRADOR está confirmado. Otros estados
                    deben coincidir con los permitidos por la base de datos.
                  </p>
                </div>
              )}

              {compraEditar && (
                <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                  El proveedor y el total no se pueden modificar desde
                  este formulario porque el endpoint PUT solo acepta
                  número de compra y estado.
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
                    : compraEditar
                      ? "Guardar Cambios"
                      : "Guardar Compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Compras;