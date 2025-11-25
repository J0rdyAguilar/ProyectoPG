import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getSanciones, desactivarSancion } from "../../api/sanciones";

function Sanciones() {
  const [sanciones, setSanciones] = useState([]);
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      const res = await getSanciones();
      setSanciones(res.data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las sanciones", "error");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleDesactivar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Desactivar sanción?",
      text: "La sanción quedará inactiva",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#16a34a",
    });

    if (!confirm.isConfirmed) return;

    try {
      await desactivarSancion(id);
      cargar();
      Swal.fire("Listo", "La sanción fue desactivada", "success");
    } catch {
      Swal.fire("Error", "Error al desactivar", "error");
    }
  };

  return (
    <div className="p-6">

      {/* TÍTULO + BOTÓN */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Sanciones</h1>

        <button
          onClick={() => navigate("/empleados/sanciones/nueva")}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2 rounded-full shadow"
        >
          Nueva sanción
        </button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">ID</th>
              <th className="px-4 py-3 text-sm font-semibold">Empleado</th>
              <th className="px-4 py-3 text-sm font-semibold">Nombre</th>
              <th className="px-4 py-3 text-sm font-semibold">Descripción</th>
              <th className="px-4 py-3 text-sm font-semibold text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {sanciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                  No hay sanciones activas
                </td>
              </tr>
            ) : (
              sanciones.map((s) => (
                <tr
                  key={s.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{s.id}</td>

                  <td className="px-4 py-3">
                    {s.empleado?.nombre} {s.empleado?.apellido}
                  </td>

                  <td className="px-4 py-3">{s.nombre}</td>

                  <td className="px-4 py-3">{s.descripcion}</td>

                  {/* ACCIONES */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">

                      {/* BOTÓN — EDITAR */}
                      <button
                        onClick={() => navigate(`/empleados/sanciones/editar/${s.id}`)}
                        className="px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
                      >
                        Editar
                      </button>

                      {/* BOTÓN — DESACTIVAR */}
                      <button
                        onClick={() => handleDesactivar(s.id)}
                        className="px-4 py-2 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
                      >
                        Desactivar
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sanciones;
