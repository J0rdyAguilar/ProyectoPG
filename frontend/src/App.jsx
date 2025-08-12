import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'

// Páginas
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import Empleados from './pages/Empleados'
import NuevaEmpleado from './pages/NuevaEmpleado'
import EditarEmpleado from './pages/EditarEmpleado'
import Dependencias from './pages/Dependencias'
import Puestos from './pages/Puestos'

// Componente de ruta protegida
function RutaProtegida({ children, token, usuario }) {
  if (!token || !usuario) {
    return <Navigate to="/login" replace />
  }
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
      console.error('Token inválido:', error)
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
      setToken(tokenAlmacenado)
      autenticarUsuario(tokenAlmacenado)
    } else {
      setCargando(false)
    }
  }, [])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')

    try {
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUsuario(null)
      window.location.href = '/login'
    }
  }

  if (cargando) {
    return <p style={{ padding: '1rem' }}>Cargando...</p>
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? "/perfil" : "/login"} />} />
      <Route path="/login" element={<Login setToken={setToken} autenticarUsuario={autenticarUsuario} />} />

      <Route
        path="/perfil"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <Perfil usuario={usuario} onLogout={handleLogout} />
          </RutaProtegida>
        }
      />

      <Route
        path="/empleados"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <Empleados />
          </RutaProtegida>
        }
      />

      <Route
        path="/empleados/nuevo"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <NuevaEmpleado />
          </RutaProtegida>
        }
      />

      <Route
        path="/empleados/editar/:id"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <EditarEmpleado />
          </RutaProtegida>
        }
      />

      <Route
        path="/dependencias"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <Dependencias />
          </RutaProtegida>
        }
      />

      <Route
        path="/puestos"
        element={
          <RutaProtegida token={token} usuario={usuario}>
            <Puestos />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  )
}

export default App
