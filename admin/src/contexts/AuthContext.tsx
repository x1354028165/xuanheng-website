import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '../lib/axios';

interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin-token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('admin-user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/admin/login', { email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('admin-token', t);
    localStorage.setItem('admin-user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setToken(null);
    setUser(null);
  }, []);

  // 启动时验证 token 有效性（Strapi 不可用时保留 token，不强制退出）
  useEffect(() => {
    const storedToken = localStorage.getItem('admin-token');
    if (!storedToken) return;
    api.get('/admin/users/me').catch((err) => {
      // 只有真实的 401 才清除 token
      // 502/503/网络错误 = Strapi 暂时不可用，保留 token
      if (err.response?.status === 401) {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        setToken(null);
        setUser(null);
      }
      // 其他错误（网络/502）静默忽略，保持登录态
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
