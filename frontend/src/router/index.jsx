  import { createBrowserRouter, Navigate } from "react-router-dom";
  import RequireAuth from "./RequireAuth.jsx";
  import DashboardLayout from "../layouts/DashboardLayout.jsx";

  // Páginas generales
  import Login from "../pages/Login.jsx";
  import Dashboard from "../pages/Dashboard.jsx";
  import Dependencias from "../pages/Dependencias.jsx";
  import NuevaDependencia from "../pages/NuevaDependencia.jsx";
  import Roles from "../pages/Roles.jsx";
  import NuevoRol from "../pages/NuevoRol.jsx";
  import Puestos from "../pages/Puestos.jsx";
  import NuevoPuesto from "../pages/NuevoPuesto.jsx";
  import Perfil from "../pages/Perfil.jsx";

  // ---- Sección EMPLEADOS ----
  import EmpleadosLayout from "../pages/empleados/EmpleadosLayout.jsx";
  import EmpleadosIndex from "../pages/empleados/Empleados.jsx";
  import Contratos from "../pages/empleados/Contratos.jsx";
  import NuevaEmpleado from "../pages/empleados/NuevaEmpleado.jsx";
  import EditarEmpleado from "../pages/empleados/EditarEmpleado.jsx";
  import PermisosLaborales from "../pages/empleados/PermisosLaborales.jsx";

  // ---- Sanciones ----
  import Sanciones from "../pages/Empleados/Sanciones.jsx";
  import NuevaSancion from "../pages/Empleados/NuevaSancion.jsx";

  export const router = createBrowserRouter([
    { path: "/", element: <Navigate to="/login" replace /> },

    { path: "/login", element: <Login /> },

    {
      element: <RequireAuth />, // Protege todas las rutas internas
      children: [
        {
          path: "/", 
          element: <DashboardLayout />, // Layout principal
          children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },

            // Dashboard
            { path: "dashboard", element: <Dashboard /> },

            // -------------------------------
            // SECCIÓN EMPLEADOS
            // -------------------------------
            {
              path: "empleados",
              element: <EmpleadosLayout />,
              children: [
                { index: true, element: <EmpleadosIndex /> },

                // Contratos
                { path: "contratos", element: <Contratos /> },

                // Solicitudes (tu menú usa esta)
                { path: "solicitudes", element: <PermisosLaborales /> },

                // 🔥 Sanciones (necesaria)
                { path: "sanciones", element: <Sanciones /> },
                { path: "sanciones/nueva", element: <NuevaSancion /> },
                { path: "sanciones/editar/:id", element: <NuevaSancion /> },

                // Empleado CRUD
                { path: "nuevo", element: <NuevaEmpleado /> },
                { path: "editar/:id", element: <EditarEmpleado /> },
              ],
            },

            // Dependencias
            { path: "dependencias", element: <Dependencias /> },
            { path: "dependencias/nueva", element: <NuevaDependencia /> },

            // Roles
            { path: "roles", element: <Roles /> },
            { path: "roles/nuevo", element: <NuevoRol /> },

            // Puestos
            { path: "puestos", element: <Puestos /> },
            { path: "puestos/nuevo", element: <NuevoPuesto /> },

            // Perfil
            { path: "perfil", element: <Perfil /> },
          ],
        },
      ],
    },

    { path: "*", element: <Navigate to="/login" replace /> },
  ]);
