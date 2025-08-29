// frontend/src/api/contratos.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("userToken");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

export async function listarContratos({ empleado_id, estado, page = 1 }) {
  const params = {};
  if (empleado_id) params.empleado_id = empleado_id;
  if (estado !== undefined) params.estado = estado;
  params.page = page;

  const { data } = await axios.get(`${API_URL}/api/contratos`, {
    headers: authHeaders(),
    params,
  });
  return data;
}

// Crear: FormData normal, SIN forzar Content-Type
export async function crearContrato(formData) {
  const { data } = await axios.post(`${API_URL}/api/contratos`, formData, {
    headers: authHeaders(),
  });
  return data;
}

// Editar: usar POST + _method=PUT, y SIN forzar Content-Type
export async function actualizarContrato(id, formData) {
  formData.append("_method", "PUT");
  const { data } = await axios.post(`${API_URL}/api/contratos/${id}`, formData, {
    headers: authHeaders(),
  });
  return data;
}

export async function cambiarEstadoContrato(id, estado) {
  const { data } = await axios.put(
    `${API_URL}/api/contratos/${id}/estado`,
    { ESTADO: Boolean(estado) },
    { headers: authHeaders() }
  );
  return data;
}

export function urlDescargaContrato(id) {
  return `${API_URL}/api/contratos/${id}/download`;
}
