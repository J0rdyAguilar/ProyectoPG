import { api } from "@/api/axios"; // o "../api/axios"

export const getDependencias = () => api.get("/dependencias");

export const getPuestos = (dependencia_id) =>
  api.get("/puestos", { params: dependencia_id ? { dependencia_id } : {} });

export const desactivarPuesto = (id) =>
  api.put(`/puestos/${id}/desactivar`);
