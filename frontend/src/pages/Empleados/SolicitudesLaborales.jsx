import { useEffect, useState, useMemo } from "react";
import { PlusCircle } from "lucide-react";
import {
  listarSolicitudes,
  crearSolicitud,
  aprobarSolicitud,
  validarSolicitud,
  desactivarSolicitud,
} from "@/api/solicitudes";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

console.log("🚀 SolicitudesLaborales cargado");

const tipos = [
  { value: "permiso", label: "Permiso" },
  { value: "licencia", label: "Licencia" },
  { value: "vacacion", label: "Vacación" },
  { value: "suspension", label: "Suspensión" },
];

export default function SolicitudesLaborales() {
  const [empleados, setEmpleados] = useState([]);
  const [lista, setLista] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("1");
  const [tipo, setTipo] = useState("permiso");
  const [motivo, setMotivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);

  const token = useMemo(
    () => localStorage.getItem("token") || localStorage.getItem("userToken"),
    []
  );
  const rolId = parseInt(localStorage.getItem("rol_id") || "0");

  // Cargar empleados
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/empleados`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          params: { page: 1, per_page: 500 },
        });
        const arr = Array.isArray(data?.data) ? data.data : data;
        console.log("👥 Empleados cargados:", arr);
        setEmpleados(arr || []);
        if (arr?.length && !selectedEmpleado) {
          setSelectedEmpleado(String(arr[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [API_URL, token]);

  // Cargar solicitudes
  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await listarSolicitudes({
        empleado_id: selectedEmpleado,
        estado: estadoFiltro,
        tipo,
      });
      setLista(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmpleado) cargarSolicitudes();
  }, [selectedEmpleado, estadoFiltro, tipo]);

  // Crear solicitud
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpleado || !motivo || !fechaInicio) {
      alert("Todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      await crearSolicitud({
        tipo,
        motivo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        empleado_id: selectedEmpleado,
      });
      alert("Solicitud creada");
      setMotivo("");
      setFechaInicio("");
      setFechaFin("");
      cargarSolicitudes();
    } catch (err) {
      console.error(err);
      alert("Error al guardar solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Acciones
  const handleAprobar = async (id) => {
    try {
      await aprobarSolicitud(id);
      cargarSolicitudes();
    } catch {
      alert("Error al aprobar");
    }
  };

  const handleValidar = async (id) => {
    try {
      await validarSolicitud(id);
      cargarSolicitudes();
    } catch {
      alert("Error al validar");
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await desactivarSolicitud(id);
      cargarSolicitudes();
    } catch {
      alert("Error al desactivar");
    }
  };

  // Formateo de fechas
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-GT");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitudes Laborales</h1>

      {/* Formulario */}
      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nueva solicitud</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Tipo *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Empleado *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedEmpleado}
              onChange={(e) => setSelectedEmpleado(e.target.value)}
            >
              <option value="">-- Selecciona empleado --</option>
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre
                    ? `${e.id} - ${e.nombre} ${e.apellido || ""}`
                    : `${e.id} - ${e.nombres || ""}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Motivo *</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Inicio *</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm">Fin</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          <PlusCircle size={18} />
          Guardar solicitud
        </button>
      </form>

      <div className="bg-white border rounded-xl overflow-auto">
        <table className="min-w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 w-24">Tipo</th>
              <th className="px-4 py-2 w-56">Empleado</th>
              <th className="px-4 py-2 w-64">Motivo</th>
              <th className="px-4 py-2 w-32">Inicio</th>
              <th className="px-4 py-2 w-32">Fin</th>
              <th className="px-4 py-2 w-28">Estado</th>
              <th className="px-4 py-2 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  No hay solicitudes
                </td>
              </tr>
            )}
            {lista.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{s.tipo}</td>
                <td className="px-4 py-2">
                  {s.empleado
                    ? `${s.empleado.id} - ${s.empleado.nombre || s.empleado.nombres} ${s.empleado.apellido || s.empleado.apellidos || ""}`
                    : "-"}
                </td>
                <td className="px-4 py-2 truncate max-w-xs">{s.motivo}</td>
                <td className="px-4 py-2">{new Date(s.fecha_inicio).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  {s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      s.estado ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {s.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {rolId === 2 && !s.aprobado_por && (
                    <button onClick={() => handleAprobar(s.id)} className="text-blue-600 hover:underline">
                      Aprobar
                    </button>
                  )}
                  {rolId === 1 && s.aprobado_por && !s.validado_por && (
                    <button onClick={() => handleValidar(s.id)} className="text-green-600 hover:underline">
                      Validar
                    </button>
                  )}
                  {s.estado === 1 && (
                    <button onClick={() => handleDesactivar(s.id)} className="text-red-600 hover:underline">
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
