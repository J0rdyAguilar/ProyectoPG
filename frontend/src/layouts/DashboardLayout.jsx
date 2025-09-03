// src/layouts/DashboardLayout.jsx (Código completo y final)

import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  Menu,
  BarChart3,
  Users,
  Layers,
  Briefcase,
  Shield,
  UserRound,
  FileText,
  LogOut,
  ChevronDown,
  List, // ✅ CAMBIO 1: Ícono "List" importado
} from "lucide-react";
import { logout } from "@/api/auth";

// Item base para ítems simples
const NavItem = ({ to, icon: Icon, label, open }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "sidebar-item",
        isActive && "sidebar-item--active",
        !open && "justify-center"
      )
    }
    title={!open ? label : undefined}
  >
    <Icon size={20} />
    {open && <span className="font-medium">{label}</span>}
  </NavLink>
);

// ✅ CAMBIO 2: Componente SubItem con estilos de Tailwind CSS
const SubItem = ({ to, icon: Icon, label }) => (
  <NavLink
    end
    to={to}
    className={({ isActive }) =>
      clsx(
        // Estilos base para todos los sub-items
        "flex items-center w-full p-2 pl-3 my-1 text-sm font-medium rounded-lg transition-colors duration-150",
        // Estilos condicionales (si está activo o no)
        isActive
          ? "bg-emerald-100 text-emerald-700 font-semibold" // Estilo ACTIVO
          : "text-slate-600 hover:bg-emerald-50"       // Estilo INACTIVO y hover
      )
    }
  >
    {/* El ícono y el texto */}
    {Icon && <Icon size={16} className="mr-3" />}
    <span>{label}</span>
  </NavLink>
);


export default function DashboardLayout() {
  const [open, setOpen] = useState(true); // ancho del sidebar
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Submenú: detecta si estamos en /empleados
  const isInEmpleados = pathname.startsWith("/empleados");
  const [openEmp, setOpenEmp] = useState(isInEmpleados);
  useEffect(() => setOpenEmp(isInEmpleados), [isInEmpleados]);

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
          "bg-bg border-r border-soft transition-all duration-300 p-4 sticky top-0 h-screen hidden md:block",
          open ? "w-64" : "w-20"
        )}
      >
        {/* LOGO + toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl2 bg-primary text-white grid place-items-center font-bold">
              E
            </div>
            {open && (
              <span className="font-semibold text-lg whitespace-nowrap">
                Muni de Cuilco
              </span>
            )}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-primary-50 text-primary-700"
            onClick={() => setOpen((o) => !o)}
            aria-label="Alternar sidebar"
            title="Alternar sidebar"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col gap-1">
          {/* Dashboard */}
          <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" open={open} />

          {/* Carpeta: Empleados */}
          <button
            type="button"
            onClick={() => setOpenEmp((v) => !v)}
            className={clsx(
              "sidebar-item w-full justify-between",
              !open && "justify-center",
              isInEmpleados && "sidebar-item--active"
            )}
            title={!open ? "Empleados" : undefined}
          >
            <span className="flex items-center gap-3">
              <Users size={20} />
              {open && <span className="font-medium">Empleados</span>}
            </span>
            {open && (
              <ChevronDown
                size={18}
                className={clsx("transition-transform", openEmp && "rotate-180")}
              />
            )}
          </button>

          {/* ✅ CAMBIO 3: Subitems de empleados actualizados */}
          {open && openEmp && (
            <div role="group" className="mt-1 mb-2 ml-4 mr-2">
              <SubItem to="/empleados" icon={List} label="Listado" />
              <SubItem to="/empleados/contratos" icon={FileText} label="Contratos" />
            </div>
          )}

          {/* Otros módulos raíz */}
          <NavItem to="/dependencias" icon={Layers} label="Dependencias" open={open} />
          <NavItem to="/puestos" icon={Briefcase} label="Puestos" open={open} />
          <NavItem to="/roles" icon={Shield} label="Roles" open={open} />
          <NavItem to="/perfil" icon={UserRound} label="Perfil" open={open} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={clsx("sidebar-item mt-4", !open && "justify-center")}
            title={!open ? "Cerrar sesión" : undefined}
          >
            <LogOut size={20} />
            {open && <span className="font-medium">Cerrar sesión</span>}
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 border-b border-soft bg-card sticky top-0 z-20">
          <div className="h-full container flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Toggle en móvil */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-primary-50 text-primary-700"
                onClick={() => setOpen((o) => !o)}
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>
              <div className="text-lg font-semibold">Dashboard</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="bg-white border border-soft rounded-xl2 px-3 h-10 outline-none w-40 md:w-64 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Buscar..."
              />
              <div className="w-9 h-9 bg-primary text-white rounded-full grid place-items-center">
                👤
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}