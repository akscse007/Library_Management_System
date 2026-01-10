// frontend/src/api/axios.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// token key used across the app
export const TOKEN_KEY = "lms_token";

const API = axios.create({
  baseURL: BASE,
  withCredentials: true, // required to receive httpOnly cookies from the API
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header from localStorage if token present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
