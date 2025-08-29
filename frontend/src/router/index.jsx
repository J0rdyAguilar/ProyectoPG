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
import NuevoPuesto from "@/pages/NuevoPuesto.jsx"; // 👈 nuevo import

import Perfil from "@/pages/Perfil.jsx";
import Contratos from "@/pages/Contratos.jsx";

import Dashboard from "@/pages/Dashboard.jsx";


export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          { path: "/dashboard", element: <Dashboard /> },

          { path: "/empleados", element: <Empleados /> },
          { path: "/empleados/nuevo", element: <NuevaEmpleado /> },
          { path: "/empleados/editar/:id", element: <EditarEmpleado /> },

          { path: "/dependencias", element: <Dependencias /> },
          { path: "/dependencias/nueva", element: <NuevaDependencia /> },

          { path: "/roles", element: <Roles /> },
          { path: "/roles/nuevo", element: <NuevoRol /> },

          { path: "/puestos", element: <Puestos /> },
          { path: "/puestos/nuevo", element: <NuevoPuesto /> }, // 👈 nueva ruta

          { path: "/perfil", element: <Perfil /> },
          { path: "/contratos", element: <Contratos /> }, // debajo de Perfil en el menú

        ],
      },
    ],
  },

  { path: "*", element: <Navigate to="/login" replace /> },
]);
