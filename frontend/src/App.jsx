import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Páginas principales
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import Dependencias from './pages/Dependencias'
import Puestos from './pages/Puestos'
import Roles from './pages/Roles'
import Dashboard from './pages/Dashboard'

// Páginas de empleados
import Empleados from './pages/empleados/Empleados'
import NuevaEmpleado from './pages/empleados/NuevaEmpleado'
import EditarEmpleado from './pages/empleados/EditarEmpleado'
import SolicitudesLaborales from './pages/empleados/SolicitudesLaborales'
import Contratos from './pages/empleados/Contratos'
import PermisosLaborales from './pages/empleados/PermisosLaborales'

// Ruta protegida
function RutaProtegida({ children, token, usuario }) {
  if (!token || !usuario) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  const autenticarUsuario = async (token) => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsuario(res.data.usuario)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setUsuario(null)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const tokenAlmacenado = localStorage.getItem('token')
    if (tokenAlmacenado) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${tokenAlmacenado}`
      setToken(tokenAlmacenado)
      autenticarUsuario(tokenAlmacenado)
    } else {
      setCargando(false)
    }
  }, [])

  if (cargando) return <p>Cargando...</p>

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
              axios.defaults.headers.common["Authorization"] = `Bearer ${tk}`
              setToken(tk)
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
            <DashboardLayout />
          </RutaProtegida>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Perfil */}
        <Route path="perfil" element={<Perfil usuario={usuario} />} />

        {/* Empleados */}
        <Route path="empleados" element={<Empleados />} />
        <Route path="empleados/nuevo" element={<NuevaEmpleado />} />
        <Route path="empleados/editar/:id" element={<EditarEmpleado />} />
        <Route path="empleados/contratos" element={<Contratos />} />
        <Route path="empleados/permisos" element={<PermisosLaborales />} />
        <Route path="empleados/solicitudes" element={<SolicitudesLaborales />} />

        {/* Catálogos */}
        <Route path="dependencias" element={<Dependencias />} />
        <Route path="puestos" element={<Puestos />} />
        <Route path="roles" element={<Roles />} />

        {/* Catch-all dentro del layout */}
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Route>
    </Routes>
  )
}

export default App
