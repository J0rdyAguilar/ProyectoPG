// src/pages/Empleados.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "@/api/http"; // baseURL = tu /api

export default function Empleados() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    http.get("/empleados").then((r) => setData(r.data));
  }, []);

  const rows = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return data;
    return data.filter((e) =>
      [e.nombre, e.apellido, e.numero_identificacion, e.dependencia, e.puesto, e.rol]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      {/* Encabezado y botón nuevo empleado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Listado de empleados</h1>
        <Link to="/empleados/nuevo" className="btn-primary">
          + Nuevo empleado
        </Link>
      </div>

      {/* Buscador */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre, DPI, dependencia..."
        className="input"
      />

      {/* Tabla */}
      <div className="table-wrap">
        <table className="min-w-[980px] w-full">
          <thead className="thead">
            <tr>
              <th className="th">ID</th>
              <th className="th">Nombre</th>
              <th className="th">DPI</th>
              <th className="th">Celular</th>
              <th className="th">Dirección</th>
              <th className="th">Puesto</th>
              <th className="th">Dependencia</th>
              <th className="th">Rol</th>
              <th className="th">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-soft">
            {rows.map((e) => (
              <tr key={e.id} className="odd:bg-white even:bg-slate-50/60">
                <td className="td">{e.id}</td>

                <td className="td font-medium">
                  {e.nombre} {e.apellido}
                </td>

                <td className="td">{e.numero_identificacion}</td>
                <td className="td">{e.numero_celular}</td>

                <td className="td max-w-[320px] truncate" title={e.direccion || ""}>
                  {e.direccion}
                </td>

                <td className="td">
                  <span className="badge">{e.puesto}</span>
                </td>

                <td className="td">
                  <span className="badge">{e.dependencia}</span>
                </td>

                <td className="td">
                  <span className="badge">{e.rol || "—"}</span>
                </td>

                <td className="td">
                  <Link to={`/empleados/editar/${e.id}`} className="btn-ghost">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}

            {!rows.length && (
              <tr>
                <td colSpan="9" className="py-10 text-center text-ink-muted">
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
