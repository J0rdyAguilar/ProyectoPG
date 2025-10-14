import React, { createContext, useContext, useState } from "react";
import * as auth from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [empleado, setEmpleado] = useState(() => {
    const saved = localStorage.getItem("empleado");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // 🔹 Login
  const login = async (credenciales) => {
    const data = await auth.login(credenciales);
    setUser(data.usuario);
    setEmpleado(data.empleado);
    setToken(data.token);
  };

  // 🔹 Logout
  const logout = async () => {
    await auth.logout();
    setUser(null);
    setEmpleado(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, empleado, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
