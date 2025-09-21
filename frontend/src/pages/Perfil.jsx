import React from 'react';
import { UserCircle, Mail, Briefcase, Building, Shield } from 'lucide-react';

// Recibimos el objeto 'usuario' como una prop directamente desde App.jsx
export default function Perfil({ usuario }) {

  // Si por alguna razón el usuario aún no ha cargado, no mostramos nada.
  if (!usuario) {
    return <div className="text-center p-10">Cargando información del usuario...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle size={48} className="text-gray-400" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{usuario.nombre}</h1>
            <p className="text-gray-600">{usuario.usuario}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Información de la Cuenta</h2>
            <div className="flex items-center text-gray-600">
              <Shield size={18} className="mr-3 text-emerald-600 flex-shrink-0" />
              <span>Rol: <strong>{usuario.rol?.nombre || 'No asignado'}</strong></span>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Información Laboral</h2>
            <div className="flex items-center text-gray-600">
              <Briefcase size={18} className="mr-3 text-emerald-600 flex-shrink-0" />
              <span>Puesto: <strong>{usuario.empleado?.puesto?.nombre || 'No asignado'}</strong></span>
            </div>
            <div className="flex items-center text-gray-600">
              <Building size={18} className="mr-3 text-emerald-600 flex-shrink-0" />
              <span>Dependencia: <strong>{usuario.empleado?.dependencia?.nombre || 'No asignada'}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

