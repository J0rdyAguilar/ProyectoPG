// src/router/Routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/Login'
import Perfil from '../pages/Perfil'
import Empleados from '../pages/Empleados'
import NuevoEmpleado from '../pages/NuevoEmpleado'
import EditarEmpleado from '../pages/EditarEmpleado'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empleados"
        element={
          <ProtectedRoute>
            <Empleados />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empleados/nuevo"
        element={
          <ProtectedRoute>
            <NuevoEmpleado />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empleados/editar/:id"
        element={
          <ProtectedRoute>
            <EditarEmpleado />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default AppRoutes
