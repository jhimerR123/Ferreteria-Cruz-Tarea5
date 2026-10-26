
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const formularioInicial = {
  nombre_rol: "",
  descripcion: "",
  estado: true,
};

function Roles() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolEditar, setRolEditar] = useState(null);
  const [formulario, setFormulario] = useState(formularioInicial);
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

  async function cargarRoles() {
    setCargando(true);
    setError("");

    try {
      const datos = await consultarAPI("/api/v1/roles/");

      if (!Array.isArray(datos)) {
        throw new Error("La API no devolvió una lista de roles.");
      }

      setRoles(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarRoles();
  }, []);

  function abrirNuevo() {
    setRolEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(rol) {
    setRolEditar(rol);

    setFormulario({
      nombre_rol: rol.nombre_rol ?? "",
      descripcion: rol.descripcion ?? "",
      estado: rol.estado === true,
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setRolEditar(null);
    setError("");
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarRol(evento) {
    evento.preventDefault();

    if (!formulario.nombre_rol.trim()) {
      setError("Debes ingresar el nombre del rol.");
      return;
    }

    setGuardando(true);
    setError("");

    const esEdicion = rolEditar !== null;

    const datos = {
      nombre_rol: formulario.nombre_rol.trim(),
      descripcion: formulario.descripcion.trim(),
      estado: formulario.estado,
    };

    const ruta = esEdicion
      ? `/api/v1/roles/${rolEditar.id_rol}`
      : "/api/v1/roles/";

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setRolEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarRoles();

      setMensaje(
        esEdicion
          ? "Rol actualizado correctamente."
          : "Rol registrado correctamente."
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
            Gestión de Roles
          </h2>

          <p className="mt-2 text-slate-500">
            Administración de roles y estados del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nuevo Rol
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

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {cargando ? (
          <p className="text-slate-500">
            Cargando roles...
          </p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Nombre del rol</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-5 text-center text-slate-500"
                  >
                    No existen roles registrados.
                  </td>
                </tr>
              ) : (
                roles.map((rol) => (
                  <tr
                    key={rol.id_rol}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {rol.id_rol}
                    </td>

                    <td className="p-3 font-medium">
                      {rol.nombre_rol}
                    </td>

                    <td className="p-3">
                      {rol.descripcion || "Sin descripción"}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          rol.estado
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {rol.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(rol)}
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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloRol"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3
                id="tituloRol"
                className="text-xl font-bold text-slate-800"
              >
                {rolEditar ? "Editar Rol" : "Registrar Rol"}
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

            <form onSubmit={guardarRol} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-100 p-4 text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="nombre_rol"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Nombre del rol
                </label>

                <input
                  id="nombre_rol"
                  name="nombre_rol"
                  type="text"
                  required
                  maxLength={100}
                  value={formulario.nombre_rol}
                  onChange={actualizarCampo}
                  placeholder="Ejemplo: Encargado de almacén"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  value={formulario.descripcion}
                  onChange={actualizarCampo}
                  placeholder="Describe las responsabilidades del rol"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="estado"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Estado
                </label>

                <select
                  id="estado"
                  value={formulario.estado ? "true" : "false"}
                  onChange={(evento) =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      estado: evento.target.value === "true",
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                    : rolEditar
                      ? "Guardar Cambios"
                      : "Guardar Rol"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;
