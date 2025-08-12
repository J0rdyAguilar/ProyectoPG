// src/router/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth.jsx";
import DashboardLayout from "@/layouts/DashboardLayout.jsx";

import Login from "@/pages/Login.jsx";
import Empleados from "@/pages/Empleados.jsx";
import NuevaEmpleado from "@/pages/NuevaEmpleado.jsx";
import EditarEmpleado from "@/pages/EditarEmpleado.jsx";
import Dependencias from "@/pages/Dependencias.jsx";
import NuevaDependencia from "@/pages/NuevaDependencia.jsx";
import Roles from "@/pages/Roles.jsx";
import NuevoRol from "@/pages/NuevoRol.jsx";
import Puestos from "@/pages/Puestos.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/empleados" replace /> },

          { path: "/empleados", element: <Empleados /> },
          { path: "/empleados/nuevo", element: <NuevaEmpleado /> },
          { path: "/empleados/editar/:id", element: <EditarEmpleado /> },


          { path: "/dependencias", element: <Dependencias /> },
          { path: "/dependencias/nueva", element: <NuevaDependencia /> },

          { path: "/roles", element: <Roles /> },
          { path: "/roles/nuevo", element: <NuevoRol /> },

          { path: "/puestos", element: <Puestos /> },

          
        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
