import React, { createContext, useContext, useState } from "react";

type AuthUser = { id: string; email: string } | null;
const AuthContext = createContext<{
  user: AuthUser;
  setUser: (u: AuthUser) => void;
}>({ user: null, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}