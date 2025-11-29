import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE, withCredentials: true });
api.interceptors.request.use(cfg => {
const token = localStorage.getItem('accessToken');
if(token) cfg.headers.Authorization = `Bearer ${token}`;
return cfg;
});
export default api;