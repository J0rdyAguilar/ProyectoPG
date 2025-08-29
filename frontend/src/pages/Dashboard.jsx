// frontend/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "@/api/dashboard";
import {
  Users,
  CheckCircle2,
  XCircle,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const d = await getDashboard();
        setData(d);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const t = data?.totales || { empleados: 0, activos: 0, inactivos: 0 };
  const deps = data?.por_dependencia || [];
  const puestos = data?.por_puesto || [];

  // datasets para los charts
  const donaData = useMemo(
    () => [
      { name: "Activos", value: Number(t.activos || 0) },
      { name: "Inactivos", value: Number(t.inactivos || 0) },
    ],
    [t]
  );

  const depsData = useMemo(
    () => deps.map(d => ({ name: d.dependencia, total: Number(d.total || 0) })),
    [deps]
  );

  const puestosData = useMemo(
    () => puestos.map(p => ({ name: p.puesto, total: Number(p.total || 0) })),
    [puestos]
  );

  // paleta de colores para barras
  const BAR_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed", "#0ea5e9"];

  if (loading) {
    return (
      <div className="p-6 grid gap-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-28 bg-gray-100 rounded-xl border" />
          <div className="h-28 bg-gray-100 rounded-xl border" />
          <div className="h-28 bg-gray-100 rounded-xl border" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-100 rounded-xl border lg:col-span-2" />
          <div className="h-80 bg-gray-100 rounded-xl border" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          title="Empleados registrados"
          value={t.empleados}
          icon={<Users size={20} />}
          sub="+ empleados totales"
        />
        <Card
          title="Activos"
          value={t.activos}
          icon={<CheckCircle2 size={20} />}
          accent="green"
          sub="Con contrato vigente"
        />
        <Card
          title="Inactivos"
          value={t.inactivos}
          icon={<XCircle size={20} />}
          accent="red"
          sub="Sin actividad"
        />
      </div>

      {/* Sección gráficos */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Barras: Dependencias */}
        <Panel
          title="Empleados por dependencia"
          icon={<BarChart3 size={18} />}
          className="lg:col-span-2"
        >
          {depsData.length === 0 ? (
            <Empty>Sin datos de dependencias</Empty>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={depsData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 80 }} // Aumenté el margen inferior
                  barCategoryGap="22%"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Bar dataKey="total" name="Total" radius={[8, 8, 0, 0]}>
                    {depsData.map((_, i) => (
                      <Cell key={`deps-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Dona: Activos vs Inactivos */}
        <Panel title="Estado de empleados" icon={<PieIcon size={18} />}>
          <div className="h-80 flex flex-col items-center justify-center">
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={donaData}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donaData.map((entry, i) => (
                      <Cell
                        key={`dona-${i}`}
                        fill={i === 0 ? "#16a34a" : "#e5e7eb"} // verde / gris
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}`, "Empleados"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-ink-muted">
              {t.activos} activos / {t.inactivos} inactivos
            </div>
          </div>
        </Panel>
      </div>

      {/* Barras: Puestos */}
      <Panel title="Empleados por puesto" icon={<BarChart3 size={18} />}>
        {puestosData.length === 0 ? (
          <Empty>Sin datos de puestos</Empty>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={puestosData}
                margin={{ top: 10, right: 20, left: 0, bottom: 80 }} // Aumenté el margen inferior
                barCategoryGap="22%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                <Bar dataKey="total" name="Total" radius={[8, 8, 0, 0]}>
                  {puestosData.map((_, i) => (
                    <Cell key={`puestos-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Card({ title, value, icon, sub, accent }) {
  const ring =
    accent === "green"
      ? "ring-1 ring-green-200 bg-green-50/60"
      : accent === "red"
      ? "ring-1 ring-red-200 bg-red-50/60"
      : "ring-1 ring-gray-200 bg-white";

  return (
    <div className={`rounded-xl border ${ring} p-4 hover:shadow-sm transition`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-ink-muted">
          <div className="w-9 h-9 rounded-lg bg-white border grid place-items-center">
            {icon}
          </div>
          <span className="text-sm">{title}</span>
        </div>
      </div>
      <div className="text-3xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-ink-muted mt-1">{sub}</div>}
    </div>
  );
}

function Panel({ title, icon, children, className = "" }) {
  return (
    <div className={`rounded-xl border bg-white ${className}`}>
      <div className="p-4 border-b flex items-center gap-2">
        {icon}
        <h2 className="font-medium">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Empty({ children }) {
  return (
    <div className="h-32 grid place-items-center text-sm text-ink-muted">
      {children}
    </div>
  );
}