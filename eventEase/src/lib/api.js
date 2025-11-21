import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:3100';

const api = axios.create({
  baseURL,
  // withCredentials: true, // enable if backend uses cookies/sessions
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      // clear token and notify app
      try { localStorage.removeItem('token'); } catch(e) {}
      window.dispatchEvent(new CustomEvent('api:unauthorized'));
    }
    return Promise.reject(err);
  }
);

export function setAuthToken(token) {
  if (!token) return clearAuthToken();
  try {
    localStorage.setItem('token', token);
  } catch (e) {}
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  try {
    localStorage.removeItem('token');
  } catch (e) {}
  delete api.defaults.headers.common['Authorization'];
}

export default api;
