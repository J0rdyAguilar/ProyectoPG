import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import clsx from "clsx";
import { Menu, Transition } from "@headlessui/react";
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
  AlertTriangle,
} from "lucide-react";
import { logout } from "@/api/auth";
import logoMuni from "../assets/logo-muni.png";

/* ================== COMPONENTES ================== */

const NavItem = ({ to, icon: Icon, label, open }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center gap-3 rounded-lg p-2 transition-colors duration-150",
        isActive
          ? "bg-green-600 text-white font-semibold"
          : "text-white/90 hover:bg-green-600 hover:text-white",
        !open && "justify-center"
      )
    }
    title={!open ? label : undefined}
  >
    <Icon size={20} />
    {open && (
      <span className="truncate text-sm font-medium whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
  </NavLink>
);

const SubItem = ({ to, icon: Icon, label, open }) => (
  <NavLink
    end
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex items-center w-full p-2 pl-3 my-1 text-sm font-medium rounded-lg transition-colors duration-150",
        isActive
          ? "bg-green-500 text-white font-semibold"
          : "text-white/90 hover:bg-green-600",
        !open && "justify-center"
      )
    }
    title={!open ? label : undefined}
  >
    {Icon && <Icon size={16} className="mr-3 flex-shrink-0" />}
    {open && (
      <span className="truncate text-sm whitespace-nowrap overflow-hidden">
        {label}
      </span>
    )}
  </NavLink>
);

/* ================== LAYOUT PRINCIPAL ================== */

export default function DashboardLayout({ usuario }) {
  const [open, setOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(true);
      else setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const rolId = usuario?.rol_id;
  const isRRHH = rolId === 1;
  const isJefe = rolId === 2;
  const isUsuario = rolId === 3;

  return (
    <div className="min-h-screen flex bg-bg text-ink relative">
      <aside
        className={clsx(
          "transition-all duration-300 p-4 fixed md:sticky top-0 h-screen flex flex-col text-white bg-green-700 z-40",
          open ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20",
          "md:flex"
        )}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <div
              className={clsx(
                "flex items-center justify-center overflow-hidden transition-all duration-300 flex-shrink-0 rounded-full bg-white",
                open ? "w-10 h-10" : "w-12 h-12 mx-auto"
              )}
            >
              <img
                src={logoMuni}
                alt="Logo Municipalidad de Cuilco"
                className={clsx(
                  "object-contain transition-all duration-300",
                  open ? "w-9 h-9" : "w-11 h-11"
                )}
              />
            </div>
            {open && (
              <span className="font-semibold text-lg text-white whitespace-nowrap overflow-hidden">
                Muni de Cuilco
              </span>
            )}
          </div>

          <button
            className="p-2 rounded-lg hover:bg-green-600 text-white/80 flex-shrink-0 md:hidden"
            onClick={() => setOpen(false)}
          >
            <MenuIcon size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-hidden">
          <NavItem to="/dashboard" icon={BarChart3} label="Dashboard" open={open} />

          {(isRRHH || isJefe) && (
            <>
              <button
                type="button"
                onClick={() => setOpenEmp((v) => !v)}
                className={clsx(
                  "flex items-center justify-between w-full rounded-lg p-2 text-white/90 hover:bg-green-600",
                  isInEmpleados && "bg-green-600 text-white font-semibold"
                )}
              >
                <span className="flex items-center gap-3 overflow-hidden">
                  <Users size={20} />
                  {open && (
                    <span className="font-medium truncate whitespace-nowrap">
                      Empleados
                    </span>
                  )}
                </span>
                {open && (
                  <ChevronDown
                    size={18}
                    className={clsx("transition-transform", openEmp && "rotate-180")}
                  />
                )}
              </button>

              {open && openEmp && (
                <div role="group" className="mt-1 mb-2 ml-4 mr-2">
                  <SubItem to="/empleados" icon={List} label="Listado" open={open} />
                  <SubItem
                    to="/empleados/contratos"
                    icon={FileText}
                    label="Contratos"
                    open={open}
                  />
                  <SubItem
                    to="/empleados/solicitudes"
                    icon={ClipboardList}
                    label="Solicitudes"
                    open={open}
                  />

                  {/* 🔥 NUEVO: SANCIONES */}
                  <SubItem
                    to="/empleados/sanciones"
                    icon={AlertTriangle}
                    label="Sanciones"
                    open={open}
                  />
                </div>
              )}
            </>
          )}

          {isRRHH && (
            <>
              <NavItem to="/dependencias" icon={Layers} label="Dependencias" open={open} />
              <NavItem to="/puestos" icon={Briefcase} label="Puestos" open={open} />
              <NavItem to="/roles" icon={Shield} label="Roles" open={open} />
            </>
          )}

          {isUsuario && (
            <div className="mt-3 border-t border-white/20 pt-3">
              {open && (
                <h2 className="text-xs font-semibold uppercase text-white/70 px-3 mb-2">
                  Mi gestión
                </h2>
              )}

              <SubItem
                to="/empleados/contratos"
                icon={FileText}
                label="Mis contratos"
                open={open}
              />

              <SubItem
                to="/empleados/solicitudes"
                icon={ClipboardList}
                label="Mis solicitudes"
                open={open}
              />
            </div>
          )}
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-soft bg-card sticky top-0 z-20">
          <div className="h-full container flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-green-100 text-green-700"
                onClick={() => setOpen((o) => !o)}
              >
                <MenuIcon size={22} />
              </button>
              <div className="text-lg font-semibold">Dashboard</div>
            </div>

            <div className="flex items-center gap-3">
              <input
                className="bg-white border border-soft rounded-xl2 px-3 h-10 outline-none w-40 md:w-64 text-sm text-ink placeholder:text-ink-muted"
                placeholder="Buscar..."
              />
              <Menu as="div" className="relative">
                <Menu.Button className="w-9 h-9 bg-green-600 text-white rounded-full grid place-items-center hover:bg-green-700">
                  <UserRound size={20} />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5">
                    <div className="px-1 py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/perfil"
                            className={`${
                              active ? "bg-emerald-500 text-white" : "text-gray-900"
                            } group flex items-center w-full px-2 py-2 text-sm rounded-md`}
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
                            className={`${
                              active ? "bg-emerald-500 text-white" : "text-gray-900"
                            } group flex items-center w-full px-2 py-2 text-sm rounded-md`}
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

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
