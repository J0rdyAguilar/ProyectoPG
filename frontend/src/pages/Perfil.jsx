// src/pages/Perfil.jsx
import { useNavigate } from 'react-router-dom'

function Perfil({ usuario, onLogout }) {
  const navigate = useNavigate()

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Bienvenido, {usuario?.nombre}</h1>
      <p><strong>Usuario:</strong> {usuario?.usuario}</p>
      <p><strong>Rol:</strong> {usuario?.rol?.nombre ?? 'Sin rol'}</p>

      {usuario?.rol?.nombre === 'Administrador' && (
        <button
          onClick={() => navigate('/empleados/nuevo')}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          + Crear usuario
        </button>
      )}

      <br />
    </div>
  )
}

export default Perfil
