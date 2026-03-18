import axios from 'axios';

const api = axios.create({
  baseURL: '/strapi', // v2
  timeout: 15000,
});

const TRANSLATE_API_TOKEN = '21a9dbf1160da2234884e9211003c7586c5a9d329d5f1cc13926fbc506f163f086c4cc4aff07ed13592f309f6f42a4d8329de153baca15fa6ae76e180e36138143326d397c42c349e5cf75b483cf9fe1434aed057f0bdcab3e9a48f937fd5e66c5e69376912c917b94322103913f9d22a2b1c62e8926fef4d9dab35fa2e14c73';

api.interceptors.request.use((config) => {
  const url = config.url || '';
  // 翻译路由使用专用 API token（admin JWT 对 /api/ 路径无效）
  if (url.includes('/api/translate/')) {
    config.headers.Authorization = `Bearer ${TRANSLATE_API_TOKEN}`;
  } else {
    const token = localStorage.getItem('admin-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
