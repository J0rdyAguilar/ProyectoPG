import { useEffect, useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  listarSolicitudes,
  crearSolicitud,
  aprobarSolicitud,
  validarSolicitud,
  desactivarSolicitud,
} from "@/api/solicitudes";

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

  const token = localStorage.getItem("token");
  const rolId = parseInt(localStorage.getItem("rol_id") || "0");

  useEffect(() => {
    const cargarEmpleados = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/empleados", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEmpleados(data.data || []);
        if (!selectedEmpleado && data.data?.length) {
          setSelectedEmpleado(String(data.data[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    cargarEmpleados();
  }, [token]);

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

  const handleAprobar = async (id) => {
    try {
      await aprobarSolicitud(id);
      cargarSolicitudes();
    } catch (err) {
      alert("Error al aprobar");
    }
  };

  const handleValidar = async (id) => {
    try {
      await validarSolicitud(id);
      cargarSolicitudes();
    } catch (err) {
      alert("Error al validar");
    }
  };

  const handleDesactivar = async (id) => {
    try {
      await desactivarSolicitud(id);
      cargarSolicitudes();
    } catch (err) {
      alert("Error al desactivar");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitudes Laborales</h1>

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
              {empleados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre || e.nombres}
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
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Motivo</th>
              <th className="px-4 py-2">Inicio</th>
              <th className="px-4 py-2">Fin</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((s) => (
              <tr key={s.id}>
                <td>{s.tipo}</td>
                <td>{s.empleado?.nombre || "-"}</td>
                <td>{s.motivo}</td>
                <td>{new Date(s.fecha_inicio).toLocaleDateString()}</td>
                <td>{s.fecha_fin ? new Date(s.fecha_fin).toLocaleDateString() : "-"}</td>
                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      s.estado ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {s.estado ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="flex gap-2">
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
