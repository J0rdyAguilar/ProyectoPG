// src/main.jsx MODIFICADO

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./index.css";

// --- 1. AÑADE ESTAS DOS LÍNEAS ---
import AppGate from "./components/AppGate";      // El componente que controla la lógica
import './components/SplashScreen.css';         // Los estilos del splash screen

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* --- 2. ENVUELVE RouterProvider CON AppGate --- */}
    <AppGate>
      <RouterProvider router={router} />
    </AppGate>
  </React.StrictMode>
);