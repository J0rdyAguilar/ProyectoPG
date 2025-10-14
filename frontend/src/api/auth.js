// src/api/auth.js
import { api } from "./axios";

export async function login({ usuario, contrasena }) {
  const { data } = await api.post("/login", { usuario, contrasena });
  const token = data?.token;
  if (!token) throw new Error("No se recibió token del backend.");

  // Guardar token y datos de usuario/empleado en localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(data.usuario));
  if (data.empleado) {
    localStorage.setItem("empleado", JSON.stringify(data.empleado));
  }

  return data;
}

export async function getPerfil() {
  const { data } = await api.get("/perfil"); // usa el token del interceptor

  // Guardamos user con rol_id correcto
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: data.id,
      usuario: data.usuario,
      rol_id: data.rol_id || data.rol?.id, // si no viene directo, lo sacamos del objeto rol
      rol: data.rol?.nombre,
    })
  );

  // Guardamos empleado si existe
  if (data.empleado) {
    localStorage.setItem(
      "empleado",
      JSON.stringify({
        id: data.empleado.id,
        nombre: data.empleado.nombre,
        apellido: data.empleado.apellido,
      })
    );
  } else {
    localStorage.removeItem("empleado");
  }

  return data;
}


export async function logout() {
  try {
    await api.post("/logout");
  } catch (_) {
    // Ignoramos error si ya expiró el token
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("empleado");
  }
}
