import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "@/api/http";

export default function Roles() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/roles");
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "No se pudieron cargar los roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const rows = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return data;
    return data.filter(r =>
      [r.nombre, r.descripcion]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(t))
    );
  }, [data, q]);

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este rol?")) return;
    await http.put(`/roles/${id}/desactivar`);
    setData(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de roles</h1>
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
        <table className="min-w-[700px] w-full">
          <thead className="bg-card/60">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3 text-gray-400 text-sm border-b border-soft">
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>

        <tbody className="divide-y divide-soft">
          {loading ? (
            <tr><td colSpan="4" className="py-8 text-center text-gray-400">Cargando…</td></tr>
          ) : rows.length ? (
            rows.map(r => (
              <tr key={r.id} className="[&>td]:px-4 [&>td]:py-3">
                <td className="font-medium">{r.nombre}</td>
                <td className="max-w-[520px] truncate">{r.descripcion || "—"}</td>
                <td>
                  <span className={`px-2 py-1 text-xs rounded-lg ${
                    r.ESTADO ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800" : "bg-rose-500/15 text-rose-300"
                  }`}>
                    {r.ESTADO ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="flex gap-2">
                  {/* <Link to={`/roles/editar/${r.id}`} className="px-3 py-1 rounded-lg bg-soft hover:bg-soft/80">Editar</Link> */}

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
