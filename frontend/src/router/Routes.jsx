// src/router/Routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import DashboardLayout from "@/layouts/DashboardLayout.jsx";

// Páginas de nivel raíz
import Dashboard from "@/pages/Dashboard.jsx";
import Dependencias from "@/pages/Dependencias.jsx";
import Puestos from "@/pages/Puestos.jsx";
import Roles from "@/pages/Roles.jsx";
import Perfil from "@/pages/Perfil.jsx";

// --- Submódulo Empleados (anidado) ---
import EmpleadosLayout from "@/pages/empleados/EmpleadosLayout.jsx"; // nuevo layout con <Outlet/>
import EmpleadosIndex from "@/pages/empleados/Index.jsx";            // listado/base del módulo
import Contratos from "@/pages/empleados/Contratos.jsx";             // ahora dentro de empleados

export default function AppRoutes() {
  return (
    <Routes>
      {/* Si tienes rutas públicas (login/registro), ponlas aquí */}

      {/* Rutas privadas */}
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* EMPLEADOS (carpeta con subrutas) */}
          <Route path="/empleados" element={<EmpleadosLayout />}>
            {/* /empleados */}
            <Route index element={<EmpleadosIndex />} />
            {/* /empleados/contratos */}
            <Route path="contratos" element={<Contratos />} />
          </Route>

          {/* Otros módulos raíz */}
          <Route path="/dependencias" element={<Dependencias />} />
          <Route path="/puestos" element={<Puestos />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
