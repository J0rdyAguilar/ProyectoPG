// src/layouts/DashboardLayout.jsx (Código completo y final con menú de perfil y permisos)

import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { ClipboardList } from 'lucide-react';
import { useEffect, useState, Fragment } from "react";
import clsx from "clsx";
import { Menu, Transition } from '@headlessui/react';
import {
  Menu as MenuIcon,
  BarChart3,
  Users,
  Layers,
  Briefcase,
  Shield,
  UserRound,
  FileText,
  LogOut,
  ChevronDown,
  List,
  CalendarClock, // <-- 1. Ícono importado
} from "lucide-react";
import { logout } from "@/api/auth";

// Item base para ítems simples del sidebar
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

// Componente SubItem con estilos para el submenú
const SubItem = ({ to, icon: Icon, label }) => (
  <NavLink
    end
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center w-full p-2 pl-3 my-1 text-sm font-medium rounded-lg transition-colors duration-150",
        isActive
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "text-slate-600 hover:bg-emerald-50"
      )
    }
  >
    {Icon && <Icon size={16} className="mr-3" />}
    <span>{label}</span>
  </NavLink>
);


export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl2 bg-primary text-white grid place-items-center font-bold">E</div>
            {open && <span className="font-semibold text-lg whitespace-nowrap">Muni de Cuilco</span>}
          </div>
          <button
            className="p-2 rounded-lg hover:bg-primary-50 text-primary-700"
            onClick={() => setOpen((o) => !o)}
            aria-label="Alternar sidebar"
            title="Alternar sidebar"
          >
            <MenuIcon size={18} />
          </button>
        </div>

        {/* NAV LINKS */}
        <nav className="flex flex-col gap-1">
          <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" open={open} />

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
            {open && <ChevronDown size={18} className={clsx("transition-transform", openEmp && "rotate-180")} />}
          </button>

          {open && openEmp && (
            <div role="group" className="mt-1 mb-2 ml-4 mr-2">
              <SubItem to="/empleados" icon={List} label="Listado" />
              <SubItem to="/empleados/contratos" icon={FileText} label="Contratos" />
              {/* -- 2. Enlace añadido -- */}
              
              <SubItem to="/empleados/solicitudes" icon={ClipboardList} label="Solicitudes" />
            </div>
          )}

          <NavItem to="/dependencias" icon={Layers} label="Dependencias" open={open} />
          <NavItem to="/puestos" icon={Briefcase} label="Puestos" open={open} />
          <NavItem to="/roles" icon={Shield} label="Roles" open={open} />
          
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 border-b border-soft bg-card sticky top-0 z-20">
          <div className="h-full container flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-primary-50 text-primary-700"
                onClick={() => setOpen((o) => !o)}
                aria-label="Abrir menú"
              >
                <MenuIcon size={20} />
              </button>
              <div className="text-lg font-semibold">Dashboard</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="bg-white border border-soft rounded-xl2 px-3 h-10 outline-none w-40 md:w-64 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="Buscar..."
              />
              <Menu as="div" className="relative">
                <Menu.Button className="w-9 h-9 bg-primary text-white rounded-full grid place-items-center hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <UserRound size={20} />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/perfil"
                            className={`${active ? 'bg-emerald-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                          >
                            <UserRound className="w-5 h-5 mr-2" />
                            Mi Perfil
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${active ? 'bg-emerald-500 text-white' : 'text-gray-900'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                          >
                            <LogOut className="w-5 h-5 mr-2" />
                            Cerrar sesión
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

