// src/pages/Login.jsx
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

  // Si ya hay token, envía directo al panel
  /*useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) nav("/empleados", { replace: true });
  }, [nav]);*/

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      setLoading(true);

      // 1) Login (usa .env para la URL)
      const { data } = await axios.post(`${API_URL}/api/login`, {
        usuario,
        contrasena,
      });

      const token = data?.token;
      if (!token) {
        throw new Error("El backend no devolvió 'token'.");
      }

      // 2) Guardar token y autenticar
      localStorage.setItem("token", token);
      setToken?.(token);
      await autenticarUsuario?.(token);

      // 3) Redirigir (puedes cambiar a /perfil si prefieres)
      nav("/empleados", { replace: true });
    } catch (err) {
      // Mensaje de error amigable
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Credenciales inválidas.";
      setMensaje(apiMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 24,
          borderRadius: 16,
          border: "1px solid #1f2937",
          background: "#111827",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
          Iniciar sesión
        </h1>

        {!!mensaje && (
          <div
            style={{
              marginBottom: 12,
              fontSize: 14,
              background: "rgba(244,63,94,.1)",
              border: "1px solid rgba(244,63,94,.3)",
              padding: "8px 10px",
              borderRadius: 10,
              color: "#fecaca",
            }}
          >
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
              placeholder="tu_usuario"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: "1px solid #1f2937",
                background: "#0b1220",
                color: "white",
                padding: "0 12px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, color: "#cbd5e1" }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  background: "#0b1220",
                  color: "white",
                  padding: "0 76px 0 12px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 8,
                  background: "#1f2937",
                  color: "#e5e7eb",
                  border: "1px solid #293241",
                  cursor: "pointer",
                }}
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              borderRadius: 12,
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 14, fontSize: 12, color: "#94a3b8" }}>
          Backend: <b>{API_URL}</b> — revisa que esté corriendo y el usuario exista.
        </div>
      </div>
    </div>
  );
}

export default Login;
