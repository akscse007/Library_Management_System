// frontend/src/services/authService.js
import API, { TOKEN_KEY } from "../api/axios";

export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Register: server may set cookie and/or return token in body
export const register = async (payload) => {
  const res = await API.post("/auth/register", payload);
  // Accept multiple token field names for compatibility
  const token = res?.data?.token || res?.data?.accessToken || res?.data?.access;
  if (token) saveToken(token);
  return res;
};

// Login: server may set cookie and/or return token in body
export const login = async (payload) => {
  const res = await API.post("/auth/login", payload);
  const token = res?.data?.token || res?.data?.accessToken || res?.data?.access;
  if (token) saveToken(token);
  return res;
};

export const logout = async () => {
  try {
    await API.post("/auth/logout");
  } catch (e) {
    // ignore network errors on logout
  } finally {
    removeToken();
  }
};

// call /auth/me to verify login; works with cookie OR Authorization header
export const me = async () => {
  return API.get("/auth/me");
};
