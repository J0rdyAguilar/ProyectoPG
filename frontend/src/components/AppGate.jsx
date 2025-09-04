// src/components/AppGate.jsx

import React, { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';

// Este componente recibe como "hijo" (children) a toda tu aplicación
const AppGate = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Temporizador para empezar a desvanecer
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2500); // 2.5 segundos visible

    // Temporizador para quitar el componente del DOM
    const removeComponentTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 segundos en total (2.5s visible + 0.5s de transición)

    // Es una buena práctica limpiar los temporizadores
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeComponentTimer);
    };
  }, []);

  // Mientras showSplash sea true, muestra la pantalla de carga
  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }

  // Cuando showSplash es false, renderiza los "hijos", es decir, tu App con sus rutas.
  return <>{children}</>;
};

export default AppGate;