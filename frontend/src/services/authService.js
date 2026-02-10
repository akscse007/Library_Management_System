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
  const res = await api.post("/api/auth/register", payload);

  const token =
    res?.data?.accessToken ||
    res?.data?.token ||
    res?.data?.access;

  if (token) saveToken(token);
  return res;
};

/**
 * Login
 */
export const login = async (payload) => {
  console.log("[AUTH SERVICE] Attempting login for:", payload.email);

  const res = await api.post("/api/auth/login", payload);

  console.log(
    "[AUTH SERVICE] Login response:",
    res?.status,
    res?.data?.user?.email
  );

  const token =
    res?.data?.accessToken ||
    res?.data?.token ||
    res?.data?.access;

  if (token) {
    console.log("[AUTH SERVICE] Token found, saving");
    saveToken(token);
  } else {
    console.warn("[AUTH SERVICE] No token returned");
  }

  return res;
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } finally {
    removeToken();
  }
};

/**
 * Verify current user
 */
export const me = async () => {
  return api.get("/api/auth/me");
};
