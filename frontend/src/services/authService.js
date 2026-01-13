import api from "./api";

/**
 * CANONICAL token key - MUST match api.js
 */
export const TOKEN_KEY = "accessToken";

export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Register
 */
export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);

  // Backend returns multiple token field names for compatibility
  const token =
    res?.data?.accessToken ||
    res?.data?.token ||
    res?.data?.access;

  if (token) {
    saveToken(token);
  }

  return res;
};

/**
 * Login
 */
export const login = async (payload) => {
  console.log("[AUTH SERVICE] Attempting login for:", payload.email);
  const res = await api.post("/auth/login", payload);

  console.log("[AUTH SERVICE] Login response received:", res?.status, "user:", res?.data?.user?.email);

  // Backend returns multiple token field names for compatibility
  const token =
    res?.data?.accessToken ||
    res?.data?.token ||
    res?.data?.access;

  if (token) {
    console.log("[AUTH SERVICE] Token found, saving to localStorage");
    saveToken(token);
  } else {
    console.warn("[AUTH SERVICE] No token in response!");
  }

  return res;
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    // ignore network errors
  } finally {
    removeToken();
  }
};

/**
 * Verify current user
 */
export const me = async () => {
  return api.get("/auth/me");
};
