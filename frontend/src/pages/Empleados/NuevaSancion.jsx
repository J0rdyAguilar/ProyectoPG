import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { api as axios } from "../../api/axios";
import {
  crearSancion,
  actualizarSancion,
  getSancion,
} from "../../api/sanciones";

function NuevaSancion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    empleado_id: "",
    nombre: "",
    descripcion: "",
  });

  const cargarEmpleados = async () => {
    const res = await axios.get("/empleados");
    setEmpleados(res.data);
  };

  const cargarSancion = async () => {
    if (!id) return;
    const res = await getSancion(id);
    setForm({
      empleado_id: res.data.empleado_id,
      nombre: res.data.nombre,
      descripcion: res.data.descripcion,
    });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await actualizarSancion(id, form);
        Swal.fire("Actualizado", "La sanción fue guardada", "success");
      } else {
        await crearSancion(form);
        Swal.fire("Creado", "La sanción fue registrada", "success");
      }

      navigate("/empleados/sanciones");
    } catch (err) {
      Swal.fire("Error", "No se pudo guardar la sanción", "error");
    }
  };

  useEffect(() => {
    cargarEmpleados();
    cargarSancion();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">
        {id ? "Editar Sanción" : "Nueva Sanción"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-xl p-6 max-w-xl"
      >
        {/* EMPLEADO */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-1">
            Empleado
          </label>

          <select
            name="empleado_id"
            value={form.empleado_id}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Seleccione...</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} {e.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* NOMBRE */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-1">
            Nombre de la sanción
          </label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 h-28"
          />
        </div>

        {/* BOTONES */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow font-medium"
          >
            {id ? "Actualizar" : "Guardar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/empleados/sanciones")}
            className="px-5 py-2 rounded-full border text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevaSancion;
