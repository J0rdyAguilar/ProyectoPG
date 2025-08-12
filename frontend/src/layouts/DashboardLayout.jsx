import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import clsx from "clsx";
import {
  Menu,
  Users,
  Layers,
  Briefcase,
  Shield,
  UserRound,
  LogOut,
} from "lucide-react";
import { logout } from "@/api/auth"; // si no usas alias, usa: "../api/auth"

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl2 transition",
        isActive
          ? "bg-primary-100 text-primary-800 border-l-4 border-primary-600 font-medium"
          : "text-ink hover:bg-primary-50 hover:text-primary-700"
      )
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = window.confirm("¿Seguro que deseas cerrar sesión?");
    if (!ok) return;
    try {
      await logout();
    } finally {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex bg-bg text-ink">
      {/* SIDEBAR */}
      <aside
        className={clsx(
          "bg-bg border-r border-soft transition-all duration-300 p-4",
          open ? "w-64" : "w-20"
        )}
      >
        {/* LOGO + toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl2 bg-primary text-white grid place-items-center font-bold">
              E
            </div>
            {open && <span className="font-semibold text-lg">RRHH</span>}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-primary-50 text-primary-700"
            onClick={() => setOpen((o) => !o)}
            title="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col gap-1">
          <NavItem to="/empleados" icon={Users} label="Empleados" />
          <NavItem to="/dependencias" icon={Layers} label="Dependencias" />
          <NavItem to="/puestos" icon={Briefcase} label="Puestos" />
          <NavItem to="/roles" icon={Shield} label="Roles" />
          <NavItem to="/perfil" icon={UserRound} label="Perfil" />

          {/* Botón Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl2 text-ink hover:bg-primary-50 hover:text-primary-700 transition mt-4"
          >
            <LogOut size={20} />
            {open && <span className="font-medium">Cerrar sesión</span>}
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1">
        {/* TOPBAR */}
        <header className="h-16 border-b border-soft bg-card sticky top-0 z-10">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="text-lg font-semibold">Dashboard</div>
            <div className="flex items-center gap-3">
              <input
                className="bg-white border border-soft rounded-xl2 px-3 h-10 outline-none w-64 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Buscar..."
              />
              <div className="w-9 h-9 bg-primary text-white rounded-full grid place-items-center">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="p-6 bg-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
