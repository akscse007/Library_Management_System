// frontend/src/services/useAuth.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { TOKEN_KEY } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Single useEffect that hydrates on app start
  useEffect(() => {
    hydrate();
  }, []);

  const hydrate = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log("[HYDRATE] Token in storage:", !!token);

      if (!token) {
        console.log("[HYDRATE] No token, user is logged out");
        setUser(null);
        setLoading(false);
        return;
      }

      // Set token in API headers
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Validate token with backend
      console.log("[HYDRATE] Validating token with /auth/me...");
      const res = await api.get("/auth/me");
      const userData = res?.data?.user;

      if (userData?._id || userData?.id) {
        console.log("[HYDRATE SUCCESS] User loaded:", userData.email, "role:", userData.role);
        setUser(userData);
      } else {
        console.error("[HYDRATE] Invalid user data from /auth/me");
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
        setUser(null);
      }
    } catch (err) {
      console.error("[HYDRATE] Error:", err?.message);
      // Token is invalid, clear it
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (user, token) => {
    console.log("[LOGIN] Saving token and user for:", user.email);
    
    // CRITICAL: Save to localStorage FIRST (synchronous)
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    // THEN update React state (async, but we already have token saved)
    setUser(user);
    
    console.log("[LOGIN] Token saved, user state queued for update");
    return true; // Immediately indicate success
  };

  const logout = async () => {
    console.log("[LOGOUT] Clearing session");
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
      "Check that <AuthProvider> wraps <App /> in main.jsx."
    );
  }

  return ctx;
}