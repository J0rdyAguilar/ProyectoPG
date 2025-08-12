// src/api/auth.js
import { api } from "./axios";

export async function login({ usuario, contrasena }) {
  const { data } = await api.post("/login", { usuario, contrasena });
  const token = data?.token;
  if (!token) throw new Error("No se recibió token del backend.");
  localStorage.setItem("token", token);
  return data;
}

export async function getPerfil() {
  return api.get("/perfil"); // usa el token del interceptor
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch (_) {
    // Ignoramos error de logout (por si el token ya expiró)
  } finally {
    localStorage.removeItem("token");
  }
}
