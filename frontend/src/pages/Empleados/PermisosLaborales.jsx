import { useEffect, useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  listarPermisos,
  crearPermiso,
  desactivarPermiso,
  aprobarPermiso,
  validarPermiso,
} from "@/api/permisos";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function PermisosLaborales() {
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("1");
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({ current_page: 1, last_page: 1 });

  const [motivo, setMotivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const token = useMemo(
    () => localStorage.getItem("token") || localStorage.getItem("userToken"),
    []
  );

  const rolId = parseInt(localStorage.getItem("rol_id") || "0");

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
  }, [API_URL, token]);

  async function cargar(page = 1) {
    setLoading(true);
    try {
      const resp = await listarPermisos({
        empleado_id: selectedEmpleado,
        estado: estadoFiltro !== "" ? Number(estadoFiltro) : undefined,
        page,
      });

      setLista(resp.data ?? []);
      setPageData({
        current_page: resp.current_page ?? 1,
        last_page: resp.last_page ?? 1,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedEmpleado) cargar(1);
  }, [selectedEmpleado, estadoFiltro]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!selectedEmpleado) return alert("Selecciona un empleado.");
    if (!motivo.trim()) return alert("El motivo es obligatorio.");
    if (!fechaInicio) return alert("La fecha de inicio es obligatoria.");

    try {
      setLoading(true);
      await crearPermiso({
        empleado_id: selectedEmpleado,
        motivo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      });
      setMotivo("");
      setFechaInicio("");
      setFechaFin("");
      cargar(1);
      alert("Permiso creado exitosamente");
    } catch (err) {
      console.error("Error al guardar:", err.response?.data);
      alert("Error al guardar el permiso.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleEstado(item) {
    try {
      setLoading(true);
      await desactivarPermiso(item.id);
      cargar(pageData.current_page);
    } catch (e) {
      console.error(e);
      alert("Error al cambiar el estado");
    } finally {
      setLoading(false);
    }
  }

  const handleAprobar = async (id) => {
    try {
      setLoading(true);
      await aprobarPermiso(id);
      alert("Permiso aprobado");
      cargar(pageData.current_page);
    } catch (error) {
      console.error(error);
      alert("Error al aprobar el permiso.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (id) => {
    try {
      setLoading(true);
      await validarPermiso(id);
      alert("Permiso validado");
      cargar(pageData.current_page);
    } catch (error) {
      console.error(error);
      alert("Error al validar el permiso.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-GT");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Permisos laborales</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm mb-1">Empleado</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedEmpleado}
            onChange={(e) => setSelectedEmpleado(String(e.target.value))}
          >
            <option value="">Seleccione…</option>
            {empleados.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.nombre
                  ? `${e.id} - ${e.nombre} ${e.apellido || ""}`
                  : `${e.id} - ${e.nombres || ""}`}
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
            <option value="">Todos</option>
          </select>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border p-4 mb-8">
        <h2 className="text-lg font-medium mb-4">Nuevo permiso</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Fecha inicio *</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Fecha fin *</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Motivo *</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-70"
            disabled={loading || !selectedEmpleado}
          >
            <PlusCircle size={18} />
            Guardar permiso
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border">
        <div className="p-4 flex justify-between items-center">
          <h3 className="font-medium">Listado de permisos</h3>
          {loading && <span className="text-sm text-gray-500">Cargando…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Empleado</th>
                <th className="px-4 py-2">Motivo</th>
                <th className="px-4 py-2">Inicio</th>
                <th className="px-4 py-2">Fin</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && !loading && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    No hay permisos para mostrar
                  </td>
                </tr>
              )}
              {loading && lista.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    Cargando permisos...
                  </td>
                </tr>
              )}
              {lista.map((item) => (
                <tr key={item.id}>
                  <td>{item.empleado ? `${item.empleado.nombre} ${item.empleado.apellido}` : "Empleado no disponible"}</td>
                  <td>{item.motivo}</td>
                  <td>{formatDate(item.fecha_inicio)}</td>
                  <td>{formatDate(item.fecha_fin)}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${item.ESTADO ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {item.ESTADO ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    {rolId === 2 && !item.aprobado_por_jefe && (
                      <button
                        onClick={() => handleAprobar(item.id)}
                        className="text-blue-700 hover:underline"
                      >
                        Aprobar
                      </button>
                    )}
                    {rolId === 1 && !!item.aprobado_por_jefe && !item.validado_por_rrhh && (
                      <button
                        onClick={() => handleValidar(item.id)}
                        className="text-green-700 hover:underline"
                      >
                        Validar
                      </button>
                    )}
                    {item.ESTADO === 1 && (
                      <button
                        onClick={() => toggleEstado(item)}
                        className="text-red-700 hover:underline"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
