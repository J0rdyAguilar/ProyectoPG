import { Outlet } from "react-router-dom";

export default function EmpleadosLayout() {
  return (
    <div className="w-full">
      {/* Si quieres, pon aquí tabs, breadcrumb, filtros, etc. */}
      <Outlet />
    </div>
  );
}
