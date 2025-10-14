import { useEffect, useState, useMemo } from "react";
import { PlusCircle, Search } from "lucide-react";
import {
  listarSolicitudes,
  crearSolicitud,
  aprobarSolicitud,
  validarSolicitud,
  desactivarSolicitud,
} from "@/api/solicitudes";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const tipos = [
  { value: "permiso", label: "Permiso" },
  { value: "licencia", label: "Licencia" },
  { value: "vacacion", label: "Vacación" },
  { value: "suspension", label: "Suspensión" },
];

export default function SolicitudesLaborales() {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [lista, setLista] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState("");
  const [tipo, setTipo] = useState("permiso");
  const [motivo, setMotivo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [rolId, setRolId] = useState(0);

  const token = useMemo(
    () => localStorage.getItem("token") || localStorage.getItem("userToken"),
    []
  );

  // ✅ Detectar rol del usuario
  useEffect(() => {
    try {
      const keys = ["user", "usuario", "userData", "empleado"];
      let id = null;
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const obj = JSON.parse(raw);
        id =
          obj?.rol_id ||
          obj?.rol?.id ||
          obj?.usuario?.rol_id ||
          obj?.usuario?.rol?.id ||
          obj?.user?.rol_id ||
          obj?.user?.rol?.id ||
          obj?.empleado?.rol_id ||
          obj?.empleado?.rol?.id ||
          null;
        if (id) break;
      }
      setRolId(Number(id) || 0);
      console.log("✅ Rol detectado:", id);
    } catch (e) {
      console.error("Error detectando rol:", e);
    }
  }, []);

  // 📥 Cargar empleados
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/empleados`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          params: { page: 1, per_page: 500 },
        });
        const arr = Array.isArray(data?.data) ? data.data : data;
        setEmpleados(arr || []);
        setEmpleadosFiltrados(arr || []);
        if (arr?.length && !selectedEmpleado) {
          setSelectedEmpleado(String(arr[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [API_URL, token]);

  // 🔍 Filtrar empleados al escribir
  useEffect(() => {
    const term = busqueda.toLowerCase();
    const filtrados = empleados.filter(
      (e) =>
        e.nombre?.toLowerCase().includes(term) ||
        e.apellido?.toLowerCase().includes(term) ||
        e.nombres?.toLowerCase().includes(term) ||
        e.apellidos?.toLowerCase().includes(term)
    );
    setEmpleadosFiltrados(filtrados);
  }, [busqueda, empleados]);

  // 📥 Cargar solicitudes
  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await listarSolicitudes({
        empleado_id: selectedEmpleado,
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
  }, [selectedEmpleado, tipo]);

  // 📝 Crear solicitud
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
      alert("Solicitud creada correctamente");
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

  // ⚙️ Acciones
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
    if (!confirm("¿Seguro que deseas desactivar esta solicitud?")) return;
    try {
      await desactivarSolicitud(id);
      cargarSolicitudes();
    } catch {
      alert("Error al desactivar");
    }
  };

  // 🔄 Determinar estado visual
  const getEstadoTexto = (s) => {
    if (s.estado === 0) return "Inactivo";
    if (!s.aprobado_por && !s.validado_por) return "Pendiente";
    if (s.aprobado_por && !s.validado_por) return "Aprobado";
    if (s.aprobado_por && s.validado_por) return "Validado";
    return "Desconocido";
  };

  const getEstadoClase = (s) => {
    const estado = getEstadoTexto(s);
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-200 text-yellow-800";
      case "Aprobado":
        return "bg-blue-200 text-blue-800";
      case "Validado":
        return "bg-green-200 text-green-800";
      case "Inactivo":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // 📅 Formateo de fechas
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-GT");
  };

  // 🔒 Permisos
  const puedeCrear = rolId === 1 || rolId === 2 || rolId === 3;
  const puedeAprobar = rolId === 2;
  const puedeValidar = rolId === 1;
  const puedeDesactivar = rolId === 1 || rolId === 2;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Solicitudes Laborales</h1>

      {/* 🧾 Formulario */}
      <form onSubmit={onSubmit} className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Nueva solicitud</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm">Tipo *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              disabled={!puedeCrear}
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm flex justify-between items-center">
              Empleado *
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Search size={14} /> Buscar
              </span>
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-1"
              placeholder="Escriba un nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={!puedeCrear}
            />

            <select
              className="w-full border rounded px-3 py-2"
              value={selectedEmpleado}
              onChange={(e) => setSelectedEmpleado(e.target.value)}
              disabled={!puedeCrear}
            >
              <option value="">-- Selecciona empleado --</option>
              {empleadosFiltrados.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre
                    ? `${e.id} - ${e.nombre} ${e.apellido || ""}`
                    : `${e.id} - ${e.nombres} ${e.apellidos || ""}`}
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
              disabled={!puedeCrear}
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
              disabled={!puedeCrear}
            />
          </div>

          <div>
            <label className="text-sm">Fin</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              disabled={!puedeCrear}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!puedeCrear}
          className={`mt-4 flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-colors ${
            puedeCrear
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          <PlusCircle size={18} />
          Guardar solicitud
        </button>
      </form>

      {/* 📋 Tabla */}
      <div className="bg-white border rounded-xl overflow-auto">
        <table className="min-w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 w-24">Tipo</th>
              <th className="px-4 py-2 w-56">Empleado</th>
              <th className="px-4 py-2 w-64">Motivo</th>
              <th className="px-4 py-2 w-32">Inicio</th>
              <th className="px-4 py-2 w-32">Fin</th>
              <th className="px-4 py-2 w-32">Aprobado por</th>
              <th className="px-4 py-2 w-32">Validado por</th>
              <th className="px-4 py-2 w-28">Estado</th>
              <th className="px-4 py-2 w-40">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
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
                <td className="px-4 py-2">{formatDate(s.fecha_inicio)}</td>
                <td className="px-4 py-2">{formatDate(s.fecha_fin)}</td>
                <td className="px-4 py-2">
                  {s.aprobador ? s.aprobador.usuario : "Pendiente"}
                </td>
                <td className="px-4 py-2">
                  {s.validador ? s.validador.usuario : "Pendiente"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getEstadoClase(
                      s
                    )}`}
                  >
                    {getEstadoTexto(s)}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  {puedeAprobar && !s.aprobado_por && s.estado === 1 && (
                    <button
                      onClick={() => handleAprobar(s.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Aprobar
                    </button>
                  )}

                  {puedeValidar &&
                    s.aprobado_por &&
                    !s.validado_por &&
                    s.estado === 1 && (
                      <button
                        onClick={() => handleValidar(s.id)}
                        className="text-green-600 hover:underline"
                      >
                        Validar
                      </button>
                    )}

                  {puedeDesactivar && s.estado === 1 && (
                    <button
                      onClick={() => handleDesactivar(s.id)}
                      className="text-red-600 hover:underline"
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
    </div>
  );
}
