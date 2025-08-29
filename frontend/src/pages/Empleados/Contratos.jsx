// frontend/src/pages/Contratos.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listarContratos,
  crearContrato,
  actualizarContrato,
  cambiarEstadoContrato,
  urlDescargaContrato,
} from "@/api/contratos";
import axios from "axios";
import { Save } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Contratos() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState(""); // siempre string
  const [estadoFiltro, setEstadoFiltro] = useState("1"); // 1 activos, 0 inactivos, "" todos
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({ current_page: 1, last_page: 1 });

  // Form
  const [tipo_contrato, setTipoContrato] = useState("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");
  const [plantilla, setPlantilla] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [editId, setEditId] = useState(null);

  const token = useMemo(
    () => localStorage.getItem("token") || localStorage.getItem("userToken"),
    []
  );

  // Cargar empleados para el select
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/empleados`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          params: { page: 1, per_page: 500 },
        });
        const arr = Array.isArray(data?.data) ? data.data : data;
        setEmpleados(arr || []);
        if (arr?.length && !selectedEmpleado) setSelectedEmpleado(String(arr[0].id));
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, token]);

  // Cargar contratos
  async function cargar(page = 1) {
    if (!selectedEmpleado) return;
    setLoading(true);
    try {
      const resp = await listarContratos({
        empleado_id: selectedEmpleado,
        estado: estadoFiltro !== "" ? Number(estadoFiltro) : undefined,
        page,
      });
      setLista(resp.data || []);
      setPageData({ current_page: resp.current_page, last_page: resp.last_page });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpleado, estadoFiltro]);

  function resetForm() {
    setTipoContrato("");
    setFechaInicio("");
    setFechaFin("");
    setPlantilla("");
    setArchivo(null);
    setEditId(null);
  }

  // helper: formatea errores 422 de Laravel
  function mensajesError(err) {
    const errors = err?.response?.data?.errors;
    const msg = err?.response?.data?.message;
    if (errors && typeof errors === "object") {
      const listado = Object.values(errors).flat().slice(0, 5).join("\n");
      return listado || msg || "Error de validación.";
    }
    return msg || "Error al guardar el contrato.";
  }

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!selectedEmpleado) {
      alert("Selecciona un empleado.");
      return;
    }
    if (!tipo_contrato.trim()) {
      alert("El tipo de contrato es obligatorio.");
      return;
    }
    if (!fecha_inicio) {
      alert("La fecha de inicio es obligatoria.");
      return;
    }

    const fd = new FormData();
    fd.append("empleado_id", selectedEmpleado);
    fd.append("tipo_contrato", tipo_contrato.trim());
    fd.append("fecha_inicio", fecha_inicio);
    
    if (fecha_fin) {
      fd.append("fecha_fin", fecha_fin);
    }
    if (plantilla && plantilla.trim()) {
      fd.append("plantilla", plantilla.trim());
    }
    if (archivo) {
      fd.append("archivo", archivo);
    }
    if (editId) {
      fd.append("_method", "PUT");
    }

    console.log("=== DATOS A ENVIAR ===");
    for (let [key, value] of fd.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      setLoading(true);
      if (editId) {
        await actualizarContrato(editId, fd);
      } else {
        await crearContrato(fd);
      }
      resetForm();
      cargar(1);
      alert(editId ? "Contrato actualizado correctamente" : "Contrato creado correctamente");
    } catch (err) {
      console.error("Error al guardar:", err.response?.data);
      alert(mensajesError(err));
    } finally {
      setLoading(false);
    }
  }

  function startEdit(item) {
    setEditId(item.id);
    setTipoContrato(item.tipo || item.tipo_contrato || "");
    setFechaInicio(item.inicio || item.fecha_inicio || "");
    setFechaFin(item.fin || item.fecha_fin || "");
    setPlantilla(item.plantilla || "");
    setArchivo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleEstado(item) {
    try {
      setLoading(true);
      await cambiarEstadoContrato(item.id, !item.ESTADO);
      cargar(pageData.current_page);
    } catch (e) {
      console.error(e);
      alert("Error al cambiar el estado del contrato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Contratos</h1>

      {/* Filtros */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">
            Empleado <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedEmpleado}
            onChange={(e) => setSelectedEmpleado(String(e.target.value))}
            required
          >
            <option value="" disabled>Seleccione…</option>
            {empleados.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.nombres ? `${e.id} - ${e.nombres} ${e.apellidos || ""}` : `${e.id} - ${e.nombre || ""}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Estado</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-4 mb-8">
        <h2 className="text-lg font-medium mb-4">
          {editId ? `Editar contrato #${editId}` : "Nuevo contrato"}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">
              Tipo de contrato <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={tipo_contrato}
              onChange={(e) => setTipoContrato(e.target.value)}
              required
              placeholder="Ej: Indefinido, Temporal, etc."
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Fecha inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fecha_inicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fecha fin (opcional)</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fecha_fin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Plantilla (opcional)</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={plantilla}
              onChange={(e) => setPlantilla(e.target.value)}
              placeholder="Texto base del contrato…"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Archivo {!editId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full border rounded px-3 py-2"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              required={!editId}
            />
            {editId && (
              <p className="text-xs text-gray-500 mt-1">
                Deja vacío para mantener el archivo actual
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-70"
            disabled={loading || !selectedEmpleado}
          >
            <Save size={18} />
            {editId ? (loading ? "Guardando…" : "Guardar cambios") : (loading ? "Guardando…" : "Guardar")}
          </button>
          {editId && (
            <button
              type="button"
              className="px-5 py-2 rounded-full border font-medium text-gray-700 hover:bg-gray-100"
              onClick={resetForm}
              disabled={loading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Listado de contratos</h3>
          {loading && <span className="text-sm text-gray-500">Cargando…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">No.</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Inicio</th>
                <th className="px-4 py-2">Fin</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Archivo</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    No hay contratos para mostrar
                  </td>
                </tr>
              )}
              {loading && lista.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                    Cargando contratos...
                  </td>
                </tr>
              )}
              {lista.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.id}</td>
                  {/* --- CORREGIDO --- */}
                  <td className="px-4 py-2">{item.tipo || item.tipo_contrato}</td>
                  <td className="px-4 py-2">{item.inicio || item.fecha_inicio}</td>
                  <td className="px-4 py-2">{(item.fin || item.fecha_fin) || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        item.ESTADO ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      ● {item.ESTADO ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {item.archivo_url ? (
                      <a
                        href={urlDescargaContrato(item.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-600 hover:text-blue-800"
                      >
                        Descargar
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
                        onClick={() => startEdit(item)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        className={`px-3 py-1 rounded border text-sm ${
                          item.ESTADO 
                            ? "hover:bg-red-50 text-red-600 border-red-200" 
                            : "hover:bg-green-50 text-green-600 border-green-200"
                        }`}
                        onClick={() => toggleEstado(item)}
                        disabled={loading}
                      >
                        {item.ESTADO ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación simple */}
        {pageData.last_page > 1 && (
          <div className="p-4 flex items-center gap-3">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              disabled={pageData.current_page <= 1 || loading}
              onClick={() => cargar(pageData.current_page - 1)}
            >
              « Anterior
            </button>
            <span className="text-sm">
              Página {pageData.current_page} de {pageData.last_page}
            </span>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              disabled={pageData.current_page >= pageData.last_page || loading}
              onClick={() => cargar(pageData.current_page + 1)}
            >
              Siguiente »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}