import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Eye, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
// import { getDashboard } from "@/api/http";

const mock = {
  kpis: {
    profit: 82373.21,
    orders: 7234,
    impressions: "3.1M",
    targetPct: 75
  },
  chart: [
    { m: "Jan", v: 320 }, { m: "Feb", v: 290 }, { m: "Mar", v: 360 },
    { m: "Apr", v: 340 }, { m: "May", v: 450 }, { m: "Jun", v: 380 },
    { m: "Jul", v: 600 }
  ],
  products: [
    { name: "Maneki Neko Poster", sold: 1249, change: +15.2 },
    { name: "Echoes Necklace", sold: 1145, change: +13.9 },
    { name: "Spiky Ring", sold: 1073, change: +9.5 },
    { name: "Pastel Petals Poster", sold: 1022, change: +2.3 },
  ]
};

const Card = ({ children }) => (
  <div className="bg-card border border-soft rounded-xl2 p-5">{children}</div>
);

const KPI = ({ icon: Icon, label, value, sub="+3.4%" }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        <div className="text-emerald-400 text-sm mt-1">{sub}</div>
      </div>
      <div className="w-10 h-10 rounded-xl2 bg-primary/20 grid place-items-center">
        <Icon size={20}/>
      </div>
    </div>
  </Card>
);

function Ring({ pct }) {
  const angle = Math.round((pct / 100) * 360);
  const bg = `conic-gradient(#2563eb ${angle}deg, #1f2937 ${angle}deg)`;
  return (
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 rounded-full" style={{ background: bg }} />
      <div className="absolute inset-2 rounded-full bg-card grid place-items-center text-lg font-semibold">
        {pct}%
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(mock);

  // Si tienes endpoint real:
  // useEffect(() => { getDashboard().then(r => setData(r.data)); }, []);

  const { kpis, chart, products } = data;

  return (
    <div className="grid gap-6">
      {/* KPIs */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPI icon={TrendingUp} label="Total profit" value={`$${kpis.profit.toLocaleString()}`} />
        <KPI icon={ShoppingBag} label="Total order" value={kpis.orders.toLocaleString()} sub="-2.8%" />
        <KPI icon={Eye} label="Impressions" value={kpis.impressions} sub="+4.6%" />
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Sales target</div>
              <div className="text-2xl font-semibold mt-1">1.3K / 1.8K</div>
              <div className="text-gray-400 text-sm mt-1">This month</div>
            </div>
            <Ring pct={kpis.targetPct} />
          </div>
        </Card>
      </div>

      {/* Chart + Top products */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Overview</div>
            <div className="text-sm text-gray-400 flex items-center gap-2"><Target size={16}/> Monthly</div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="m" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1f2937" }} />
                <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="text-lg font-semibold mb-4">Top products</div>
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 rounded-xl2 bg-soft" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-gray-400 text-sm">Sold: {p.sold}</div>
                  </div>
                </div>
                <div className={p.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                  {p.change > 0 ? "+" : ""}{p.change}%
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-lg font-semibold mb-2">Notes</div>
          <p className="text-gray-300 text-sm">Aquí puedes poner accesos rápidos, campañas, alertas o cualquier widget.</p>
        </Card>
      </div>
    </div>
  );
}