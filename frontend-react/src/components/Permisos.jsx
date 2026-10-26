
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const MODULOS = [
  "Usuarios",
  "Roles",
  "Permisos",
  "Productos",
  "Compras",
  "Ventas",
  "Stock",
];

const formularioInicial = {
  nombre_permiso: "",
  modulo: "",
  submenu: "",
  estado: true,
  descripcion: "",
};

function Permisos() {
  const [permisos, setPermisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [permisoEditar, setPermisoEditar] = useState(null);
  const [formulario, setFormulario] = useState({ ...formularioInicial });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

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

  async function cargarPermisos() {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarAPI("/api/v1/permisos/");

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de permisos.");
      }

      setPermisos(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPermisos();
  }, []);

  function abrirNuevo() {
    setPermisoEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(permiso) {
    setPermisoEditar(permiso);
    setFormulario({
      nombre_permiso: permiso.nombre_permiso ?? "",
      modulo: permiso.modulo ?? "",
      submenu: permiso.submenu ?? "",
      estado: permiso.estado === true,
      descripcion: permiso.descripcion ?? "",
    });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;
    setModalAbierto(false);
    setPermisoEditar(null);
    setError("");
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarPermiso(evento) {
    evento.preventDefault();
    setError("");

    if (
      !formulario.nombre_permiso.trim() ||
      !formulario.modulo.trim() ||
      !formulario.submenu.trim()
    ) {
      setError("Completa el nombre, módulo y submenú.");
      return;
    }

    setGuardando(true);

    const esEdicion = permisoEditar !== null;

    const datos = {
      nombre_permiso: formulario.nombre_permiso.trim(),
      modulo: formulario.modulo.trim(),
      submenu: formulario.submenu.trim(),
      estado: formulario.estado,
      descripcion: formulario.descripcion.trim(),
    };

    const ruta = esEdicion
      ? `/api/v1/permisos/${permisoEditar.id_permiso}`
      : "/api/v1/permisos/";

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setPermisoEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarPermisos();

      setMensaje(
        esEdicion
          ? "Permiso actualizado correctamente."
          : "Permiso registrado correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const permisosFiltrados = permisos.filter((permiso) => {
    const texto = [
      permiso.nombre_permiso,
      permiso.modulo,
      permiso.submenu,
      permiso.descripcion,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Permisos
          </h2>
          <p className="mt-2 text-slate-500">
            Registro, consulta y modificación de permisos del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nuevo Permiso
        </button>
      </div>

      {mensaje && (
        <div role="status" className="rounded-lg bg-green-100 p-4 text-green-800">
          {mensaje}
        </div>
      )}

      {error && !modalAbierto && (
        <div role="alert" className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="buscarPermiso"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Buscar permiso
        </label>

        <input
          id="buscarPermiso"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, módulo o submenú"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        {cargando ? (
          <p className="text-slate-500">Cargando permisos...</p>
        ) : (
          <table className="w-full min-w-[850px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Permiso</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Submenú</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {permisosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-slate-500">
                    No se encontraron permisos.
                  </td>
                </tr>
              ) : (
                permisosFiltrados.map((permiso) => (
                  <tr
                    key={permiso.id_permiso}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">{permiso.id_permiso}</td>
                    <td className="p-3 font-medium">
                      {permiso.nombre_permiso}
                    </td>
                    <td className="p-3">{permiso.modulo}</td>
                    <td className="p-3">{permiso.submenu}</td>
                    <td className="p-3">
                      {permiso.descripcion || "Sin descripción"}
                    </td>
                    <td className="p-3">
                      <span
                        className={
                          permiso.estado
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {permiso.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(permiso)}
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
            aria-labelledby="tituloPermiso"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3 id="tituloPermiso" className="text-xl font-bold text-slate-800">
                {permisoEditar ? "Editar Permiso" : "Registrar Permiso"}
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

            <form onSubmit={guardarPermiso} className="space-y-5 p-6">
              {error && (
                <div role="alert" className="rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="nombre_permiso" className="mb-2 block text-sm font-medium">
                  Nombre del permiso
                </label>
                <input
                  id="nombre_permiso"
                  name="nombre_permiso"
                  type="text"
                  required
                  value={formulario.nombre_permiso}
                  onChange={actualizarCampo}
                  placeholder="Ejemplo: Registrar Producto"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="modulo" className="mb-2 block text-sm font-medium">
                    Módulo
                  </label>
                  <select
                    id="modulo"
                    name="modulo"
                    required
                    value={formulario.modulo}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                  >
                    <option value="">Seleccionar módulo</option>
                    {formulario.modulo &&
                      !MODULOS.includes(formulario.modulo) && (
                        <option value={formulario.modulo}>
                          {formulario.modulo}
                        </option>
                      )}
                    {MODULOS.map((modulo) => (
                      <option key={modulo} value={modulo}>
                        {modulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="submenu" className="mb-2 block text-sm font-medium">
                    Submenú
                  </label>
                  <input
                    id="submenu"
                    name="submenu"
                    type="text"
                    required
                    value={formulario.submenu}
                    onChange={actualizarCampo}
                    placeholder="Ejemplo: Gestión de Productos"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="descripcionPermiso" className="mb-2 block text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  id="descripcionPermiso"
                  name="descripcion"
                  rows={3}
                  value={formulario.descripcion}
                  onChange={actualizarCampo}
                  placeholder="Describe la función del permiso"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label htmlFor="estadoPermiso" className="mb-2 block text-sm font-medium">
                  Estado
                </label>
                <select
                  id="estadoPermiso"
                  value={formulario.estado ? "true" : "false"}
                  onChange={(e) =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      estado: e.target.value === "true",
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

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
                    : permisoEditar
                      ? "Guardar Cambios"
                      : "Guardar Permiso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Permisos;
