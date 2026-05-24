import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const requestUrl = error.config?.url || '';
    
    // Don't show toast or redirect for /users/me check (initial auth check)
    if (status === 401 && requestUrl.includes('/users/me')) {
      return Promise.reject(error);
    }

    if (status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      toast.error('Сеанс истек. Войдите заново');
    }
    
    if (status && status >= 500) {
      toast.error('Сервер временно недоступен. Попробуйте позже');
    } else if (status !== 401 && data?.message) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      toast.error(msg);
    }
    
    return Promise.reject(error);
  }
);

export default api;
