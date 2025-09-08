import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Login({ setToken, autenticarUsuario }) {
  const nav = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  // Si ya hay token, manda al dashboard
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) nav("/dashboard", { replace: true });
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      setLoading(true);

      const { data } = await axios.post(`${API_URL}/api/login`, {
        usuario,
        contrasena,
      });

      const token = data?.token;
      if (!token) throw new Error("El backend no devolvió 'token'.");

      const usuarioData = data?.usuario;
      if (!usuarioData) throw new Error("El backend no devolvió datos del usuario.");

      // Guarda datos en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("usuario_id", usuarioData.id);
      localStorage.setItem("rol_id", usuarioData.rol_id);
      localStorage.setItem("rol_nombre", usuarioData.rol_nombre);

      // setea opcionalmente en axios por si lo usas global
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // obtener perfil y guardar
      const perfil = await axios.get(`${API_URL}/api/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("usuario", JSON.stringify(perfil.data));

      // callbacks opcionales
      setToken?.(token);
      await autenticarUsuario?.(token);

      // redirige al dashboard
      nav("/dashboard", { replace: true });
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.message === "string" ? err.message : "") ||
        "Credenciales inválidas.";
      setMensaje(apiMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid place-items-center bg-bg">
      <div className="card w-full max-w-md p-6">
        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary mb-1">
            Municipalidad de Cuilco
          </h1>
          <p className="text-sm text-ink-muted">Sistema de gestión interna</p>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-ink">Iniciar sesión</h2>

        {!!mensaje && (
          <div className="card p-3 mb-3 border-red-200 bg-red-50 text-red-700">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-3">
          {/* Usuario */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Usuario</span>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              placeholder="tu usuario"
              className="input"
            />
          </label>

          {/* Contraseña */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Contraseña</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                placeholder="***********"
                className="input pr-24"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-3 rounded-lg border border-soft bg-white text-ink hover:border-primary hover:text-primary"
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-9 px-8 mt-1 disabled:opacity-60 mx-auto max-w-xs"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-xs text-ink-muted text-center">
          Versión 0.1
        </div>
      </div>
    </div>
  );
}

export default Login;
