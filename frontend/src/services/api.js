import axios from "axios";

/**
 * Resolve API base URL
 * - VITE_API_BASE should be set in production
 * - Fallback is safe for local dev
 */
const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() ||
  "http://localhost:4000/api";

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000, // fail fast in production
});

/**
 * REQUEST INTERCEPTOR
 * Attaches JWT token if present
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Centralized error handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / CORS / server unreachable
    if (!error.response) {
      console.error("Network error or server unreachable");
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Auth errors → force logout
    if (status === 401 || status === 403) {
      console.warn("Auth error, clearing session");

      localStorage.removeItem("accessToken");

      // Optional: redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
