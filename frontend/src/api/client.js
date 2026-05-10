import axios from 'axios';

const TOKEN_KEY = 'mc_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStorage.clear();
    }
    return Promise.reject(err);
  }
);

export const extractError = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.fieldErrors) {
    return Object.values(err.response.data.fieldErrors).join(', ');
  }
  return err.message || 'Naməlum xəta';
};

export default api;
