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
    // 只有明确的 401（token 无效/过期）才跳转登录
    // 网络错误、Strapi 重启中的 502/503 等不跳转
    if (error.response?.status === 401) {
      const token = localStorage.getItem('admin-token');
      // 只有当前有 token 时才处理（避免登录请求本身 401 触发循环）
      if (token && !error.config?.url?.includes('/admin/login')) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
