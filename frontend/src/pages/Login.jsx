// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import fondoLogin from "@/assets/cuilco.jpg"; // 🖼️ Asegúrate de que la imagen exista

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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${fondoLogin})`, // Fondo principal
      }}
    >
      {/* Capa oscura para contraste */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>

      {/* Contenedor del login */}
      <div className="relative z-10 card w-full max-w-md p-8 bg-white/95 border border-gray-200 rounded-2xl shadow-2xl">
        {/* Encabezado */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-green-700 mb-1">
            Municipalidad de Cuilco
          </h1>
          <p className="text-sm text-gray-600">Sistema de gestión interna</p>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-800 text-left">
          Iniciar sesión
        </h2>

        {!!mensaje && (
          <div className="p-3 mb-3 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-3">
          {/* Usuario */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-800">Usuario</span>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              placeholder="tu usuario"
              className="w-full border border-green-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </label>

          {/* Contraseña */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-800">Contraseña</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                placeholder="***********"
                className="w-full border border-green-500 rounded-lg px-3 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 rounded-md border border-green-500 bg-white text-green-700 text-sm hover:bg-green-50"
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-full transition-all disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Versión 0.1
        </div>
      </div>
    </div>
  );
}

export default Login;
