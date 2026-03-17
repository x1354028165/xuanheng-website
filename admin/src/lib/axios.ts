import axios from 'axios';

const api = axios.create({
  baseURL: '/strapi', // v2
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin-token');
      localStorage.removeItem('admin-user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
