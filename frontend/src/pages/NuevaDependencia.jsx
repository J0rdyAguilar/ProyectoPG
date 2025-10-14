import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "@/api/http";

export default function NuevaDependencia() {
  const { id } = useParams(); // Detectar si estamos editando
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // 📌 Si hay id => es edición, entonces cargamos los datos
  useEffect(() => {
    if (id) {
      setModoEdicion(true);
      (async () => {
        try {
          const { data } = await http.get(`/dependencias/${id}`);
          setNombre(data.nombre);
          setDescripcion(data.descripcion || "");
        } catch (error) {
          console.error(error);
          alert("No se pudo cargar la dependencia.");
        }
      })();
    }
  }, [id]);

  // 📌 Guardar o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      if (modoEdicion) {
        // Actualizar dependencia existente
        await http.put(`/dependencias/${id}`, { nombre, descripcion });
        alert("Dependencia actualizada correctamente");
      } else {
        // Crear nueva dependencia
        await http.post("/dependencias", { nombre, descripcion });
        alert("Dependencia registrada correctamente");
      }
      navigate("/dependencias");
    } catch (error) {
      console.error(error);
      alert("Error al guardar la dependencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {modoEdicion ? "Editar dependencia" : "Registrar nueva dependencia"}
        </h1>
        <button
          onClick={() => navigate("/dependencias")}
          className="btn-ghost inline-flex h-10 items-center gap-2"
        >
          Volver
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-md shadow"
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              className="input w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Dirección de Recursos Humanos"
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
              placeholder="Descripción opcional de la dependencia"
            ></textarea>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading
              ? "Guardando..."
              : modoEdicion
              ? "Guardar cambios"
              : "Guardar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dependencias")}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
