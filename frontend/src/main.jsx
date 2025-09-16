// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Mantengo tu lógica de AppGate y SplashScreen
import AppGate from "./components/AppGate";      
import "./components/SplashScreen.css";         

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppGate>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppGate>
  </React.StrictMode>
);
