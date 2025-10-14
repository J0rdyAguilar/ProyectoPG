// frontend/src/pages/empleados/Contratos.jsx
import { useEffect, useMemo, useState } from "react";
import {
  listarContratos,
  crearContrato,
  actualizarContrato,
  cambiarEstadoContrato,
} from "@/api/contratos";
import axios from "axios";
import { Save, Search, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// 🔹 Función de descarga segura con token
async function descargarContrato(id) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(`${API_URL}/api/contratos/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob", // importante para archivos
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Extrae nombre del archivo del header o crea uno por defecto
    const contentDisposition = response.headers["content-disposition"];
    let fileName = `contrato_${id}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) fileName = match[1];
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar contrato:", error);
    alert("No se pudo descargar el contrato.");
  }
}

export default function Contratos() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("1");
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({ current_page: 1, last_page: 1 });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [tipo_contrato, setTipoContrato] = useState("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");
  const [plantilla, setPlantilla] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [editId, setEditId] = useState(null);

  const token = useMemo(() => localStorage.getItem("token"), []);

  // 🔹 Detección robusta del rol
  let rolId = null;
  try {
    const keys = ["user", "usuario", "userData", "empleado"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      rolId =
        obj?.rol_id ||
        obj?.rol?.id ||
        obj?.usuario?.rol_id ||
        obj?.usuario?.rol?.id ||
        obj?.empleado?.rol_id ||
        obj?.empleado?.rol?.id ||
        null;
      if (rolId) break;
    }
  } catch (err) {
    console.error("Error detectando rol del usuario:", err);
  }

  const esRRHH = Number(rolId) === 1;
  console.log("✅ Rol detectado:", rolId, "→ es RRHH?", esRRHH);

  // 📌 Cargar empleados
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/empleados`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const arr = Array.isArray(data?.data) ? data.data : data;
        setEmpleados(arr || []);
        if (arr?.length && !selectedEmpleado) {
          setSelectedEmpleado(String(arr[0].id));
        }
      } catch (e) {
        console.error("Error cargando empleados:", e);
      }
    })();
  }, [API_URL, token]);

  // 📌 Cargar contratos
  async function cargar(page = 1) {
    if (!selectedEmpleado) return;
    setLoading(true);
    try {
      const resp = await listarContratos({
        empleado_id: selectedEmpleado,
        estado: estadoFiltro !== "" ? Number(estadoFiltro) : undefined,
        page,
        search: debouncedSearchTerm,
      });
      setLista(resp.data || []);
      setPageData({
        current_page: resp.current_page ?? 1,
        last_page: resp.last_page ?? 1,
      });
    } catch (e) {
      console.error("Error cargando contratos:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar(1);
  }, [selectedEmpleado, estadoFiltro, debouncedSearchTerm]);

  function resetForm() {
    setTipoContrato("");
    setFechaInicio("");
    setFechaFin("");
    setPlantilla("");
    setArchivo(null);
    setEditId(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!esRRHH) return alert("No tienes permisos para crear contratos.");
    if (!selectedEmpleado) return alert("Selecciona un empleado.");
    if (!tipo_contrato.trim()) return alert("El tipo de contrato es obligatorio.");
    if (!fecha_inicio) return alert("La fecha de inicio es obligatoria.");

    const fd = new FormData();
    fd.append("empleado_id", selectedEmpleado);
    fd.append("tipo_contrato", tipo_contrato.trim());
    fd.append("fecha_inicio", fecha_inicio);
    if (fecha_fin) fd.append("fecha_fin", fecha_fin);
    if (plantilla && plantilla.trim()) fd.append("plantilla", plantilla.trim());
    if (archivo) fd.append("archivo", archivo);
    if (editId) fd.append("_method", "PUT");

    try {
      setLoading(true);
      if (editId) await actualizarContrato(editId, fd);
      else await crearContrato(fd);
      alert("Contrato guardado correctamente");
      resetForm();
      cargar(1);
    } catch (err) {
      console.error("Error al guardar contrato:", err);
      alert("Error al guardar contrato");
    } finally {
      setLoading(false);
    }
  }

  async function toggleEstado(item) {
    try {
      setLoading(true);
      await cambiarEstadoContrato(item.id, !item.ESTADO);
      cargar(pageData.current_page);
    } catch (e) {
      console.error("Error al cambiar estado:", e);
      alert("Error al cambiar el estado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Contratos</h1>

      {/* Filtros */}
      <div className="grid md:grid-cols-3 gap-4 mb-6 items-end">
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
            <option value="">Seleccione…</option>
            {empleados.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.nombre
                  ? `${e.id} - ${e.nombre} ${e.apellido || ""}`
                  : `${e.id} - ${e.nombres || ""} ${e.apellidos || ""}`}
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

        <div>
          <label className="block text-sm mb-1">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Por tipo, empleado, etc..."
              className="w-full border rounded pl-10 pr-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
              disabled={!esRRHH}
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
              disabled={!esRRHH}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fecha fin (opcional)</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fecha_fin}
              onChange={(e) => setFechaFin(e.target.value)}
              disabled={!esRRHH}
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
              disabled={!esRRHH}
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
              disabled={!esRRHH}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-colors ${
              esRRHH
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!esRRHH || loading || !selectedEmpleado}
          >
            <Save size={18} />
            {editId ? "Guardar cambios" : "Guardar"}
          </button>
          {editId && (
            <button
              type="button"
              className="px-5 py-2 rounded-full border font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => resetForm()}
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
                <th className="px-4 py-2">Empleado</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Inicio</th>
                <th className="px-4 py-2">Fin</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Archivo</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No hay contratos para mostrar
                  </td>
                </tr>
              )}
              {lista.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{item.id}</td>
                  <td className="px-4 py-2">
                    {item.empleado
                      ? `${item.empleado.id} - ${
                          item.empleado.nombre || item.empleado.nombres
                        } ${item.empleado.apellido || item.empleado.apellidos || ""}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{item.tipo || item.tipo_contrato}</td>
                  <td className="px-4 py-2">{item.inicio || item.fecha_inicio}</td>
                  <td className="px-4 py-2">{item.fin || item.fecha_fin || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                        item.ESTADO
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      ● {item.ESTADO ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {item.archivo_url ? (
                      <button
                        onClick={() => descargarContrato(item.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Download size={16} />
                        Descargar
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
