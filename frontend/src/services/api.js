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
 * TOKEN KEY - MUST match authService.js
 */
export const TOKEN_KEY = "accessToken";

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
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      console.log("[API REQUEST] Adding token for:", config.method.toUpperCase(), config.url);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("[API REQUEST] No token available for:", config.method.toUpperCase(), config.url);
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
  (response) => {
    console.log(
      "[API RESPONSE] Success:",
      response.config.method.toUpperCase(),
      response.config.url,
      "Status:",
      response.status
    );
    return response;
  },
  (error) => {
    // Network / CORS / server unreachable
    if (!error.response) {
      console.error("[API ERROR] Network error or server unreachable", error.message);
      return Promise.reject(error);
    }

    const { status, config, data } = error.response;
    const message = (data && data.message) || "";

    console.error(
      `[API ERROR] ${status} on ${config.method.toUpperCase()} ${config.url}`,
      data
    );

    // Only treat errors that clearly indicate an auth/session problem as fatal.
    const isAuthEndpoint = config.url.includes("/auth/me") || config.url.includes("/auth/refresh");
    const looksLikeAuthError = /invalid|expired token|not authenticated|unauthorized/i.test(
      message
    );

    if ((status === 401 || status === 403) && (isAuthEndpoint || looksLikeAuthError)) {
      console.warn(
        "[API ERROR] Auth/session error (" + status + "), clearing session and redirecting to login"
      );

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        console.warn("[API ERROR] Redirecting to /login from:", window.location.pathname);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
