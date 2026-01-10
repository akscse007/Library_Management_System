import api from "./api";

/**
 * Canonical token key (MUST match api.js)
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
  const res = await api.post("/auth/login", payload);

  const token =
    res?.data?.accessToken ||
    res?.data?.token ||
    res?.data?.access;

  if (token) saveToken(token);

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
