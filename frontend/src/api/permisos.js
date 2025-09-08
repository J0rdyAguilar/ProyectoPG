// frontend/src/api/permisos.js
import { http } from "@/api/http";

// 📌 Listar permisos laborales con filtros y paginación
export async function listarPermisos({ empleado_id, estado, page = 1, search = "" }) {
  const params = {};
  if (empleado_id) params.empleado_id = empleado_id;
  if (estado !== undefined) params.estado = estado;
  if (search) params.buscar = search;
  params.page = page;

  const { data } = await http.get("/permisos-laborales", { params });
  return data; // devuelve { current_page, last_page, data: [] }
}

// 📌 Crear un nuevo permiso
export async function crearPermiso(payload) {
  const { data } = await http.post("/permisos-laborales", payload);
  return data;
}

// 📌 Actualizar un permiso existente
export async function actualizarPermiso(id, payload) {
  const { data } = await http.put(`/permisos-laborales/${id}`, payload);
  return data;
}

// 📌 Desactivar (cambiar estado a inactivo)
export async function desactivarPermiso(id) {
  const { data } = await http.put(`/permisos-laborales/${id}/desactivar`);
  return data;
}

// 📌 Aprobar permiso (jefe inmediato)
export async function aprobarPermiso(id) {
  const { data } = await http.put(`/permisos-laborales/${id}/aprobar`);
  return data;
}

// 📌 Validar permiso (RRHH)
export async function validarPermiso(id) {
  const { data } = await http.put(`/permisos-laborales/${id}/validar`);
  return data;
}
