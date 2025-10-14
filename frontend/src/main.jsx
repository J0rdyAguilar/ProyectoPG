// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";


// Mantienes tu lógica de AppGate y SplashScreen
import AppGate from "./components/AppGate";      
import "./components/SplashScreen.css";         

// Importar el AuthProvider
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppGate>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </AppGate>
  </React.StrictMode>
);
