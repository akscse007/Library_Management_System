import { create } from "zustand";
import API from "../api/axios";

const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  loading: false,

  /**
   * Hydrate user from backend (/auth/me)
   * This is the SINGLE source of truth
   */
  hydrate: async () => {
    try {
      set({ loading: true });
      const res = await API.get("/auth/me");
      const user = res?.data?.user || res?.data;

      if (!user || !user.role) {
        throw new Error("Invalid user payload");
      }

      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
      return user;
    } catch (err) {
      console.error("[AUTH HYDRATE FAILED]", err);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      set({ user: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Manual setter (used by admin tools if needed)
   */
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    set({ user: null });
  },
}));

export default useAuth;
