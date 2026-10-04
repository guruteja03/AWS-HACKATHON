import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cloudshare-demo-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.config?.url !== '/auth/demo-login') {
      const message = error.response?.data?.error?.message || error.message || 'Request failed.';
      window.dispatchEvent(new CustomEvent('cloudshare:error', {
        detail: { message, retry: () => api.request(error.config) },
      }));
    }
    return Promise.reject(error);
  },
);

export default api;
