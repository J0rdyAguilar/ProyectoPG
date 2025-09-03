import { NavLink } from "react-router-dom";

// Aceptamos "to", "label" y el componente del ícono como "Icon"
export default function SubItem({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end // 'end' es importante para que la ruta padre no se quede activa
      className={({ isActive }) =>
        // Clases dinámicas: unas si está activo, otras si no.
        `flex items-center w-full p-2 pl-3 my-1 text-sm font-medium rounded-lg transition-colors duration-150
        ${
          isActive
            ? "bg-emerald-100 text-emerald-800" // Estilo ACTIVO
            : "text-gray-600 hover:bg-gray-100" // Estilo INACTIVO y al pasar el mouse
        }`
      }
    >
      {/* Renderizamos el ícono que pasamos como prop */}
      {Icon && <Icon className="w-5 h-5 mr-3" strokeWidth={2} />}
      
      <span>{label}</span>
    </NavLink>
  );
}