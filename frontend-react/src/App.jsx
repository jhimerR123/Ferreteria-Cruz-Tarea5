import { useState } from "react";

import Productos from "./components/Productos";
import Usuarios from "./components/Usuarios";
import Roles from "./components/Roles";
import Permisos from "./components/Permisos";
import Compras from "./components/Compras";
import Ventas from "./components/Ventas";
import Stock from "./components/Stock";

const API_URL = "https://ferreteria-cruz-tarea5.onrender.com";

const modulos = [
  {
    nombre: "Usuarios",
    descripcion: "Administración de usuarios del sistema",
  },
  {
    nombre: "Roles",
    descripcion: "Gestión de roles administrativos",
  },
  {
    nombre: "Permisos",
    descripcion: "Control de permisos del sistema",
  },
  {
    nombre: "Productos",
    descripcion: "Registro y consulta de productos",
  },
  {
    nombre: "Compras",
    descripcion: "Gestión de compras de productos",
  },
  {
    nombre: "Ventas",
    descripcion: "Registro y control de ventas",
  },
  {
    nombre: "Stock",
    descripcion: "Control de existencias e inventario",
  },
];

function App() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [moduloActivo, setModuloActivo] = useState("Dashboard");

  async function iniciarSesion(evento) {
    evento.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const datos = new URLSearchParams();

      datos.append("username", usuario.trim());
      datos.append("password", clave);

      const respuesta = await fetch(
        `${API_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: datos,
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
        throw new Error("No se recibió el token JWT");
      }

      const token = resultado.access_token;

      const respuestaPerfil = await fetch(
        `${API_URL}/api/v1/auth/mi-perfil`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!respuestaPerfil.ok) {
        throw new Error(
          "No se pudo consultar el perfil del usuario."
        );
      }

      const datosPerfil = await respuestaPerfil.json();

      sessionStorage.setItem("token", token);

      setPerfil(datosPerfil);
      setClave("");
      setMensaje("");
      setModuloActivo("Dashboard");
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  function cerrarSesion() {
    sessionStorage.removeItem("token");

    setPerfil(null);
    setUsuario("");
    setClave("");
    setMensaje("");
    setModuloActivo("Dashboard");
  }

  function mostrarModulo() {
    switch (moduloActivo) {
      case "Usuarios":
        return <Usuarios />;

      case "Roles":
        return <Roles />;

      case "Permisos":
        return <Permisos />;

      case "Productos":
        return <Productos />;

      case "Compras":
        return <Compras />;

      case "Ventas":
        return <Ventas />;

      case "Stock":
        return <Stock />;

      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-slate-800">
              Bienvenido al sistema
            </h2>

            <p className="mt-2 text-slate-500">
              Administración de compras, ventas e inventario.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {modulos.map((modulo) => (
                <button
                  key={modulo.nombre}
                  type="button"
                  onClick={() => setModuloActivo(modulo.nombre)}
                  className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                >
                  <h3 className="text-lg font-bold text-blue-900">
                    {modulo.nombre}
                  </h3>

                  <p className="mt-3 text-sm text-slate-500">
                    {modulo.descripcion}
                  </p>
                </button>
              ))}
            </div>
          </>
        );
    }
  }

  if (!perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800 px-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-slate-800 p-8 text-center text-white">
            <h1 className="text-2xl font-bold">
              FERRETERÍA CRUZ
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Sistema Web de Compra, Venta e Inventario
            </p>
          </div>

          <form onSubmit={iniciarSesion} className="p-8">
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Iniciar sesión
            </h2>

            {mensaje && (
              <div
                role="alert"
                className="mb-5 rounded-lg bg-red-100 p-3 text-sm text-red-700"
              >
                {mensaje}
              </div>
            )}

            <div className="mb-5">
              <label
                htmlFor="loginUsuario"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Usuario
              </label>

              <input
                id="loginUsuario"
                type="text"
                required
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingrese su usuario"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="loginClave"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>

              <input
                id="loginClave"
                type="password"
                required
                autoComplete="current-password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-lg bg-blue-800 py-3 font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
            >
              {cargando
                ? "Verificando..."
                : "Ingresar al Sistema"}
            </button>

            <p className="mt-6 text-center text-xs text-slate-500">
              Ferretería Cruz - Sistema Administrativo
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="w-full bg-slate-900 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="border-b border-slate-700 p-6">
          <h2 className="text-xl font-bold">
            FERRETERÍA CRUZ
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Sistema Administrativo
          </p>
        </div>

        <nav className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => setModuloActivo("Dashboard")}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              moduloActivo === "Dashboard"
                ? "bg-blue-700 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Panel Principal
          </button>

          {modulos.map((modulo) => (
            <button
              key={modulo.nombre}
              type="button"
              onClick={() => setModuloActivo(modulo.nombre)}
              className={`w-full rounded-lg px-4 py-3 text-left transition ${
                moduloActivo === modulo.nombre
                  ? "bg-blue-700 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {modulo.nombre}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-white px-6 py-5 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Panel Administrativo
            </h1>

            <p className="text-sm text-slate-500">
              Sistema Web Ferretería Cruz
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-medium text-slate-700">
              {perfil.nombre_completo ||
                perfil.usuario ||
                "Usuario"}
            </span>

            <button
              type="button"
              onClick={cerrarSesion}
              className="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8">
          {mostrarModulo()}
        </main>
      </div>
    </div>
  );
}

export default App;