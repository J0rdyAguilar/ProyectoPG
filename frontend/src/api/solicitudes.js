import { http } from "@/api/http";

// 📌 Listar solicitudes laborales con filtros y paginación
export async function listarSolicitudes({ tipo, empleado_id, estado, page = 1, search = "" }) {
  const params = {};
  if (tipo) params.tipo = tipo;
  if (empleado_id) params.empleado_id = empleado_id;
  if (estado !== undefined) params.estado = estado;
  if (search) params.buscar = search;
  params.page = page;

  const { data } = await http.get("/solicitudes-laborales", { params });
  return data; // { current_page, last_page, data: [...] }
}

// 📌 Crear una nueva solicitud
export async function crearSolicitud(payload) {
  const { data } = await http.post("/solicitudes-laborales", payload);
  return data;
}

// 📌 Actualizar solicitud existente
export async function actualizarSolicitud(id, payload) {
  const { data } = await http.put(`/solicitudes-laborales/${id}`, payload);
  return data;
}

// 📌 Desactivar solicitud
export async function desactivarSolicitud(id) {
  const { data } = await http.put(`/solicitudes-laborales/${id}/desactivar`);
  return data;
}

// 📌 Aprobar solicitud (jefe inmediato)
export async function aprobarSolicitud(id) {
  const { data } = await http.put(`/solicitudes-laborales/${id}/aprobar`);
  return data;
}

// 📌 Validar solicitud (RRHH)
export async function validarSolicitud(id) {
  const { data } = await http.put(`/solicitudes-laborales/${id}/validar`);
  return data;
}
