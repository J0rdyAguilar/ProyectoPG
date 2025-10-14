import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Layout
import DashboardLayout from "./layouts/DashboardLayout";

// Páginas principales
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import Dependencias from "./pages/Dependencias";
import NuevaDependencia from "./pages/NuevaDependencia";
import NuevoPuesto from "./pages/NuevoPuesto";

import Puestos from "./pages/Puestos";
import Roles from "./pages/Roles";
import Dashboard from "./pages/Dashboard";

// Páginas de empleados
import Empleados from "./pages/empleados/Empleados";
import NuevaEmpleado from "./pages/empleados/NuevaEmpleado";
import EditarEmpleado from "./pages/empleados/EditarEmpleado";
import SolicitudesLaborales from "./pages/empleados/SolicitudesLaborales";
import Contratos from "./pages/empleados/Contratos";
import PermisosLaborales from "./pages/empleados/PermisosLaborales";

// -------------------------------
// Ruta protegida con validación de rol
// -------------------------------
function RutaProtegida({ children, token, usuario, rolesPermitidos }) {
  if (!token || !usuario) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol_id)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const autenticarUsuario = async (token) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/perfil", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuario(res.data);
      console.log("Usuario autenticado:", res.data);
    } catch (error) {
      console.error("Error al autenticar usuario:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const tokenAlmacenado = localStorage.getItem("token");
    if (tokenAlmacenado) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenAlmacenado}`;
      setToken(tokenAlmacenado);
      autenticarUsuario(tokenAlmacenado);
    } else {
      setCargando(false);
    }
  }, []);

  if (cargando) return <p>Cargando...</p>;

  return (
    <Routes>
      {/* Redirigir raíz */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          <Login
            setToken={(tk) => {
              axios.defaults.headers.common["Authorization"] = `Bearer ${tk}`;
              setToken(tk);
            }}
            autenticarUsuario={autenticarUsuario}
          />
        }
      />

      {/* Rutas protegidas dentro del layout */}
      <Route
        path="/"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <DashboardLayout usuario={usuario} />
          </RutaProtegida>
        }
      >
        {/* Dashboard: todos los roles */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Perfil: todos los roles */}
        <Route path="perfil" element={<Perfil usuario={usuario} />} />

        {/* Empleados */}
        <Route
          path="empleados"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1, 2]}>
              <Empleados />
            </RutaProtegida>
          }
        />
        <Route
          path="empleados/nuevo"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <NuevaEmpleado />
            </RutaProtegida>
          }
        />
        <Route
          path="empleados/editar/:id"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <EditarEmpleado />
            </RutaProtegida>
          }
        />

        {/* Contratos: CORREGIDO para permitir todos los roles */}
        <Route
          path="empleados/contratos"
          element={
            // 👇 ¡AQUÍ ESTÁ LA MAGIA! Permitimos a todos los roles con permisos.
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1, 2, 3]}>
              <Contratos />
            </RutaProtegida>
          }
        />

        {/* Permisos laborales: todos (backend filtra) */}
        <Route path="empleados/permisos" element={<PermisosLaborales />} />

        {/* Solicitudes laborales: todos (backend filtra) */}
        <Route path="empleados/solicitudes" element={<SolicitudesLaborales />} />

        {/* Catálogos: solo RRHH */}
        <Route
          path="dependencias"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <Dependencias />
            </RutaProtegida>
          }
        />
        <Route
          path="dependencias/nueva"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <NuevaDependencia />
            </RutaProtegida>
          }
        />

        <Route
          path="dependencias/editar/:id"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <NuevaDependencia />
            </RutaProtegida>
          }
        />

        <Route
          path="puestos/nuevo"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <NuevoPuesto />
            </RutaProtegida>
          }
        />
        
        <Route
          path="puestos"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <Puestos />
            </RutaProtegida>
          }
        />
        <Route
          path="roles"
          element={
            <RutaProtegida token={token} usuario={usuario} rolesPermitidos={[1]}>
              <Roles />
            </RutaProtegida>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
