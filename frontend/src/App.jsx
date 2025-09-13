import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Páginas
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import Empleados from './pages/Empleados'
import NuevaEmpleado from './pages/NuevaEmpleado'
import EditarEmpleado from './pages/EditarEmpleado'
import Dependencias from './pages/Dependencias'
import Puestos from './pages/Puestos'
import SolicitudesLaborales from './pages/empleados/SolicitudesLaborales'

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
      <Route path="/" element={<Navigate to="/perfil" />} />
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

      {/* ✅ TODAS LAS RUTAS PROTEGIDAS VAN DENTRO DEL LAYOUT */}
      <Route path="/" element={
        <RutaProtegida token={token} usuario={usuario}>
          <DashboardLayout />
        </RutaProtegida>
      }>
        <Route path="perfil" element={<Perfil usuario={usuario} />} />
        <Route path="empleados" element={<Empleados />} />
        <Route path="empleados/nuevo" element={<NuevaEmpleado />} />
        <Route path="empleados/editar/:id" element={<EditarEmpleado />} />
        <Route path="dependencias" element={<Dependencias />} />
        <Route path="puestos" element={<Puestos />} />
        <Route path="empleados/solicitudes" element={<SolicitudesLaborales />} />
      </Route>

      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  )
}

export default App
