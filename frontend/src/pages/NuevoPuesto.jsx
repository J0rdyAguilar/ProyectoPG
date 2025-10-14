import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/api/http";

export default function NuevoPuesto() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [dependencias, setDependencias] = useState([]);
  const [dependenciaId, setDependenciaId] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const fetchDependencias = async () => {
      try {
        const { data } = await http.get("/dependencias");
        setDependencias(data);
      } catch (err) {
        alert("Error al cargar dependencias");
        console.error(err);
      }
    };

    fetchDependencias();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre del puesto es obligatorio");
      return;
    }

    if (!dependenciaId) {
      alert("Debe seleccionar una dependencia");
      return;
    }

    try {
      setLoading(true);
      await http.post("/puestos", {
        nombre,
        descripcion,
        dependencia_id: dependenciaId,
      });
      alert("Puesto registrado exitosamente");
      nav("/puestos");
    } catch (err) {
      console.error(err);
      alert("Error al registrar el puesto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registrar nuevo puesto</h1>
        <button
          onClick={() => nav("/puestos")}
          className="btn-ghost inline-flex h-10 items-center gap-2"
        >
          Volver
        </button>
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-md shadow"
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del puesto
            </label>
            <input
              type="text"
              className="input w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Coordinador de Campo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              className="input w-full"
              rows="3"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Opcional: Detalle del rol o funciones"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dependencia
            </label>
            <select
              className="input w-full"
              value={dependenciaId}
              onChange={(e) => setDependenciaId(e.target.value)}
              required
            >
              <option value="">Selecciona una dependencia</option>
              {dependencias.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => nav("/puestos")}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
