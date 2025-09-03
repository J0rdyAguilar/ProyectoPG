// src/router/index.jsx - VERSIÓN CORREGIDA Y ÚNICA

import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth.jsx";
import DashboardLayout from "@/layouts/DashboardLayout.jsx";

// Páginas
import Login from "@/pages/Login.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Dependencias from "@/pages/Dependencias.jsx";
import NuevaDependencia from "@/pages/NuevaDependencia.jsx";
import Roles from "@/pages/Roles.jsx";
import NuevoRol from "@/pages/NuevoRol.jsx";
import Puestos from "@/pages/Puestos.jsx";
import NuevoPuesto from "@/pages/NuevoPuesto.jsx";
import Perfil from "@/pages/Perfil.jsx";

// ---- Importaciones para la sección de Empleados (muy importante) ----
import EmpleadosLayout from "@/pages/empleados/EmpleadosLayout.jsx"; // El layout con <Outlet/>
import EmpleadosIndex from "@/pages/empleados/Empleados.jsx";           // El listado de empleados
import Contratos from "@/pages/empleados/Contratos.jsx";
import NuevaEmpleado from "@/pages/empleados/NuevaEmpleado.jsx";
import EditarEmpleado from "@/pages/empleados/EditarEmpleado.jsx";
// --------------------------------------------------------------------

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    element: <RequireAuth />, // Protege todas las rutas internas
    children: [
      {
        path: "/", // La ruta raíz de las páginas protegidas
        element: <DashboardLayout />, // Usa el layout principal para todas
        children: [
          // Redirección por defecto al entrar a la zona protegida
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },

          // --- SECCIÓN DE EMPLEADOS (CORREGIDA Y ANIDADA) ---
          {
            path: "empleados",
            element: <EmpleadosLayout />, // Usa el layout de empleados
            children: [
              { index: true, element: <EmpleadosIndex /> }, // Ruta: /empleados
              { path: "contratos", element: <Contratos /> }, // Ruta: /empleados/contratos
              { path: "nuevo", element: <NuevaEmpleado /> },     // Ruta: /empleados/nuevo
              { path: "editar/:id", element: <EditarEmpleado /> }, // Ruta: /empleados/editar/:id
            ],
          },
          // ---------------------------------------------------

          { path: "dependencias", element: <Dependencias /> },
          { path: "dependencias/nueva", element: <NuevaDependencia /> },

          { path: "roles", element: <Roles /> },
          { path: "roles/nuevo", element: <NuevoRol /> },

          { path: "puestos", element: <Puestos /> },
          { path: "puestos/nuevo", element: <NuevoPuesto /> },

          { path: "perfil", element: <Perfil /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);