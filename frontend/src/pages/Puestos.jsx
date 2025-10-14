import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "@/api/http";

export default function Puestos() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/puestos");
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los puestos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return data;
    return data.filter(d =>
      [d.nombre, d.descripcion]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(t))
    );
  }, [data, q]);

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este puesto?")) return;
    await http.put(`/puestos/${id}/desactivar`);
    setData(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de puestos</h1>
        <Link
          to="/puestos/nuevo"
          className="btn-primary"
        >
          + Nuevo puesto
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o descripción…"
          className="w-full h-11 bg-card border border-soft rounded-xl px-3 outline-none"
        />
      </div>

      {/* Alerts */}
      {err && (
        <div className="border border-rose-500/30 bg-rose-500/10 text-rose-200 px-4 py-2 rounded-xl">
          {err}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-soft rounded-xl">
        <table className="min-w-[800px] w-full">
          <thead className="bg-card/60">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3 text-gray-400 text-sm border-b border-soft">
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-soft">
            {loading ? (
              <tr><td colSpan="4" className="py-8 text-center text-gray-400">Cargando…</td></tr>
            ) : rows.length ? (
              rows.map(d => (
                <tr key={d.id} className="[&>td]:px-4 [&>td]:py-3">
                  <td className="font-medium">{d.nombre}</td>
                  <td className="max-w-[540px] truncate">{d.descripcion || "—"}</td>

                <td className="td">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-400"></span>
                    Activo
                  </span>
                </td>

                  {/* Acciones */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/puestos/editar/${d.id}`}
                        className="btn-ghost"
                      >
                        Editar
                      </Link>
                      {d.ESTADO ? (
                        <button
                          onClick={() => desactivar(d.id)}
                          className="btn-ghost"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="py-8 text-center text-gray-400">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
