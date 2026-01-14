import axios from "axios";

/**
 * Resolve API base URL
 *
 * EXPECTED:
 *  - Production (Render):
 *      VITE_API_BASE=https://your-backend.onrender.com
 *
 *  - Local:
 *      (fallback) http://localhost:4000
 *
 * IMPORTANT:
 *  - DO NOT append `/api` here
 *  - Backend already mounts routes under `/api/*`
 */
const API_BASE =
  import.meta.env.VITE_API_BASE?.trim() ||
  "http://localhost:4000";

/**
 * TOKEN KEY
 * MUST match usage across authService, guards, etc.
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
 * Attach JWT token if present
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "[API REQUEST]",
        config.method.toUpperCase(),
        config.url,
        "(token attached)"
      );
    } else {
      console.log(
        "[API REQUEST]",
        config.method.toUpperCase(),
        config.url,
        "(no token)"
      );
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
      "[API RESPONSE]",
      response.config.method.toUpperCase(),
      response.config.url,
      "→",
      response.status
    );
    return response;
  },
  (error) => {
    // Network / CORS / server unreachable
    if (!error.response) {
      console.error("[API ERROR] Network/server error:", error.message);
      return Promise.reject(error);
    }

    const { status, config, data } = error.response;
    const message = data?.message || "";

    console.error(
      `[API ERROR] ${status} ${config.method.toUpperCase()} ${config.url}`,
      data
    );

    /**
     * Only auto-logout for real auth/session failures
     */
    const isAuthEndpoint =
      config.url.includes("/auth/me") ||
      config.url.includes("/auth/refresh");

    const looksLikeAuthError =
      /invalid|expired token|not authenticated|unauthorized/i.test(message);

    if (
      (status === 401 || status === 403) &&
      (isAuthEndpoint || looksLikeAuthError)
    ) {
      console.warn("[API] Auth/session invalid — clearing session");

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
