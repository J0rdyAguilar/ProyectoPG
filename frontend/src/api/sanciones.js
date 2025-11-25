// src/api/sanciones.js
import { api as axios } from "./axios";

export const getSanciones = () => axios.get("/sanciones");

export const getSancion = (id) => axios.get(`/sanciones/${id}`);

export const crearSancion = (data) => axios.post("/sanciones", data);

export const actualizarSancion = (id, data) =>
  axios.put(`/sanciones/${id}`, data);

export const desactivarSancion = (id) =>
  axios.put(`/sanciones/${id}/desactivar`);
