// frontend/src/stores/useAuth.js
import { create } from "zustand";
import API, { TOKEN_KEY } from "../api/axios";

// Hydrate user data by calling /auth/me using saved access token
async function fetchMe() {
  try {
    const res = await API.get("/auth/me");
    if (res.data.success) return res.data.user;
  } catch (err) {
    console.warn("fetchMe error:", err?.response?.data || err.message);
  }
  return null;
}

const useAuth = create((set) => ({
  user: null,

  // set logged-in user manually (optionally persist token)
  setUser: (user, token, refreshToken) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    set({ user });
  },

  // validate token & load user info
  hydrateUser: async () => {
    const user = await fetchMe();
    if (user) set({ user });
    else set({ user: null });
  },

  // logout function
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("refresh_token");
    API.defaults.headers.common["Authorization"] = "";
    set({ user: null });
  },
}));

export default useAuth;
