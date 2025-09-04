// src/components/SplashScreen.jsx

import React from 'react';
import './SplashScreen.css';

const SplashScreen = ({ isFadingOut }) => {
  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Nuevo elemento de texto */}
      <h2 className="splash-title">MUNICIPALIDAD DE CUILCO</h2>
      
      <img 
        src="/img/Prueba.png" 
        alt="Logo de la aplicación" 
        className="splash-logo" 
      />
    </div>
  );
};

export default SplashScreen;