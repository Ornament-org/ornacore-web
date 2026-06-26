import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const actorType = localStorage.getItem('actorType');
        const refreshPath = actorType === 'b2b'
          ? '/shopkeeper/auth/refresh'
          : '/auth/refresh';

        const { data } = await axios.post(`${API_BASE_URL}${refreshPath}`, { refreshToken });
        const newToken = data?.data?.accessToken ?? data?.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        const actorType = localStorage.getItem('actorType');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('actorType');
        window.location.href = actorType === 'b2b' ? '/business/login' : '/login';
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
