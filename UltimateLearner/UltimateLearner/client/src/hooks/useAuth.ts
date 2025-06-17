import { useState } from "react";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  function login(token: string) {
    localStorage.setItem("token", token);
    setToken(token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return { token, login, logout, isLoggedIn: !!token };
}