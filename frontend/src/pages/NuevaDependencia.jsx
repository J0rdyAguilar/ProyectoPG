import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/api/http";

export default function NuevaDependencia() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    try {
      await http.post("/dependencias", {
        nombre,
        descripcion,
      });
      alert("Dependencia registrada correctamente");
      nav("/dependencias");
    } catch (error) {
      console.error(error);
      alert("Error al registrar la dependencia");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Registrar nueva dependencia</h1>
        <button
          onClick={() => nav("/dependencias")}
          className="text-sm text-blue-600 hover:underline"
        >
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
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
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
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
          <button type="submit" className="btn-primary">Guardar</button>
          <button
            type="button"
            onClick={() => nav("/dependencias")}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
