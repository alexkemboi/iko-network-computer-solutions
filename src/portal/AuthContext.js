import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api("/auth/me");
      setUser(u);
      setServiceError("");
    } catch (e) {
      setUser(null);
      setServiceError(e.status === 401 ? "" : e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { user: u } = await api("/auth/login", { method: "POST", body: { email, password } });
    setUser(u);
    return u;
  }, []);

  const signup = useCallback(async (fields) => {
    const r = await api("/auth/signup", { method: "POST", body: fields });
    setUser(r.user);
    return r;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST", body: {} });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, serviceError, refresh, login, signup, logout }),
    [user, loading, serviceError, refresh, login, signup, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export const ROLE_LABEL = { admin: "Administrator", staff: "Staff", customer: "Customer" };
export const canAccess = (user, roles) => Boolean(user && roles.includes(user.role));
