// src/pages/Puestos.jsx
import { useEffect, useMemo, useState } from "react";
import { http } from "@/api/http"; // tu instancia axios con Bearer
import { Link } from "react-router-dom";

export default function Puestos() {
  const [data, setData]   = useState([]);
  const [q, setQ]         = useState("");
  const [loading, setL]   = useState(true);
  const [err, setErr]     = useState("");

  const load = async () => {
    try {
      setL(true);
      const { data } = await http.get("/puestos");
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los puestos");
    } finally {
      setL(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return data;
    return data.filter(p =>
      [p.nombre, p.descripcion, p?.dependencia?.nombre, p.dependencia_nombre]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(t))
    );
  }, [data, q]);

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este puesto?")) return;
    await http.put(`/puestos/${id}/desactivar`);
    setData(prev => prev.filter(x => x.id !== id)); // o marcar ESTADO = 0 si lo devuelves
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de puestos</h1>
        {/* Si luego agregas formulario para crear: */}
        {/* <Link to="/puestos/nuevo" className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90">+ Nuevo puesto</Link> */}
      </div>

      {/* Buscador */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, dependencia…"
          className="w-full h-11 bg-card border border-soft rounded-xl px-3 outline-none"
        />
      </div>

      {/* Alertas */}
      {err && (
        <div className="border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-2 rounded-xl">
          {err}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto border border-soft rounded-xl">
        <table className="min-w-[900px] w-full">
          <thead className="bg-card/60">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3 text-gray-400 text-sm border-b border-soft">
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Dependencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-soft">
            {loading ? (
              <tr><td colSpan="5" className="py-8 text-center text-gray-400">Cargando…</td></tr>
            ) : rows.length ? (
              rows.map(p => (
                <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="font-medium">{p.nombre}</td>
                  <td className="max-w-[520px] truncate">{p.descripcion || "—"}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded-lg bg-soft">
                      {p?.dependencia?.nombre || p.dependencia_nombre || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      p.ESTADO ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                    }`}>
                      {p.ESTADO ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    {/* <Link to={`/puestos/editar/${p.id}`} className="px-3 py-1 rounded-lg bg-soft hover:bg-soft/80">Editar</Link> */}
                    {p.ESTADO ? (
                      <button
                        onClick={() => desactivar(p.id)}
                        className="px-3 py-1 rounded-lg bg-soft hover:bg-soft/80"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="py-8 text-center text-gray-400">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
