
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const formularioInicial = {
  id_rol: "",
  nombre_completo: "",
  telefono: "",
  correo: "",
  usuario: "",
  clave: "",
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
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

  async function cargarDatos() {
    setCargando(true);
    setError("");

    try {
      const [datosUsuarios, datosRoles] = await Promise.all([
        consultarAPI("/api/v1/usuarios/"),
        consultarAPI("/api/v1/roles/"),
      ]);

      if (!Array.isArray(datosUsuarios)) {
        throw new Error("La API no devolvió una lista de usuarios.");
      }

      if (!Array.isArray(datosRoles)) {
        throw new Error("La API no devolvió una lista de roles.");
      }

      setUsuarios(datosUsuarios);
      setRoles(datosRoles);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirNuevo() {
    setUsuarioEditar(null);
    setFormulario({ ...formularioInicial });
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirEditar(usuario) {
    setUsuarioEditar(usuario);

    setFormulario({
      id_rol: String(usuario.id_rol ?? ""),
      nombre_completo: usuario.nombre_completo ?? "",
      telefono: usuario.telefono ?? "",
      correo: usuario.correo ?? "",
      usuario: usuario.usuario ?? "",
      clave: "",
    });

    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function actualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setUsuarioEditar(null);
    setError("");
  }

  async function guardarUsuario(evento) {
    evento.preventDefault();

    setGuardando(true);
    setError("");

    const esEdicion = usuarioEditar !== null;

    const datos = {
      id_rol: Number(formulario.id_rol),
      nombre_completo: formulario.nombre_completo.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      usuario: formulario.usuario.trim(),
    };

    if (!esEdicion) {
      datos.clave = formulario.clave;
    }

    const ruta = esEdicion
      ? `/api/v1/usuarios/${usuarioEditar.id_usuario}`
      : "/api/v1/usuarios/";

    try {
      await consultarAPI(ruta, {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify(datos),
      });

      setModalAbierto(false);
      setUsuarioEditar(null);
      setFormulario({ ...formularioInicial });

      await cargarDatos();

      setMensaje(
        esEdicion
          ? "Usuario actualizado correctamente."
          : "Usuario registrado correctamente."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  function obtenerNombreRol(idRol) {
    const rol = roles.find(
      (item) => Number(item.id_rol) === Number(idRol)
    );

    return rol?.nombre_rol ?? `Rol ${idRol}`;
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Gestión de Usuarios
          </h2>

          <p className="mt-2 text-slate-500">
            Registro, consulta y modificación de usuarios.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Nuevo Usuario
        </button>
      </div>

      {mensaje && (
        <div className="rounded-lg bg-green-100 p-4 text-green-800">
          {mensaje}
        </div>
      )}

      {error && !modalAbierto && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        {cargando ? (
          <p className="text-slate-500">
            Cargando usuarios...
          </p>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Nombre completo</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Correo</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-5 text-center text-slate-500"
                  >
                    No existen usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.id_usuario}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {usuario.id_usuario}
                    </td>

                    <td className="p-3">
                      {usuario.nombre_completo}
                    </td>

                    <td className="p-3">
                      {usuario.usuario}
                    </td>

                    <td className="p-3">
                      {usuario.correo || "—"}
                    </td>

                    <td className="p-3">
                      {usuario.telefono || "—"}
                    </td>

                    <td className="p-3">
                      {obtenerNombreRol(usuario.id_rol)}
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          usuario.estado
                            ? "font-medium text-green-700"
                            : "font-medium text-red-600"
                        }
                      >
                        {usuario.estado ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(usuario)}
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
            aria-labelledby="tituloUsuario"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl"
          >

            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h3
                id="tituloUsuario"
                className="text-xl font-bold text-slate-800"
              >
                {usuarioEditar
                  ? "Editar Usuario"
                  : "Registrar Usuario"}
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

            <form onSubmit={guardarUsuario} className="p-6">

              {error && (
                <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nombre completo
                  </label>

                  <input
                    name="nombre_completo"
                    type="text"
                    required
                    value={formulario.nombre_completo}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Teléfono
                  </label>

                  <input
                    name="telefono"
                    type="text"
                    value={formulario.telefono}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Correo electrónico
                  </label>

                  <input
                    name="correo"
                    type="email"
                    required
                    value={formulario.correo}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nombre de usuario
                  </label>

                  <input
                    name="usuario"
                    type="text"
                    required
                    value={formulario.usuario}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Rol
                  </label>

                  <select
                    name="id_rol"
                    required
                    value={formulario.id_rol}
                    onChange={actualizarCampo}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3"
                  >
                    <option value="">Seleccionar rol</option>

                    {roles.map((rol) => (
                      <option
                        key={rol.id_rol}
                        value={rol.id_rol}
                      >
                        {rol.nombre_rol}
                      </option>
                    ))}
                  </select>
                </div>

                {!usuarioEditar && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Contraseña
                    </label>

                    <input
                      name="clave"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={formulario.clave}
                      onChange={actualizarCampo}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3"
                    />
                  </div>
                )}

              </div>

              <div className="mt-8 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={guardando}
                  onClick={cerrarModal}
                  className="rounded-lg bg-slate-200 px-5 py-3 text-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white disabled:opacity-60"
                >
                  {guardando
                    ? "Guardando..."
                    : usuarioEditar
                      ? "Guardar Cambios"
                      : "Guardar Usuario"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
