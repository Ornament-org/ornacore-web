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

// Endpoints that legitimately return 401 for reasons that have nothing to do
// with an expired session (wrong password, unapproved/blocked account, a
// dead refresh token) — none of these should trigger the refresh-and-redirect
// flow below, or a plain "wrong password" turns into a forced navigation to
// the login page instead of an inline error on the form.
const AUTH_ENDPOINT_PATTERN =
  /\/auth\/(login|register|refresh|google-login|otp-login\/(?:request|verify)|password-reset\/(?:request|verify|confirm))$/;

// The backend rotates the refresh token on every use and revokes the entire
// session if an already-spent one is replayed. Two things follow from that:
// every successful refresh MUST persist the *new* refresh token (not just
// the new access token), and concurrent 401s — several requests all firing
// around the moment the access token expires — MUST share a single in-flight
// refresh rather than each independently spending the same (rapidly
// stale) refresh token, which trips reuse-detection and force-logs-out a
// perfectly valid session.
let refreshPromise = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post(`${API_BASE_URL}/shopkeeper/auth/refresh`, { refreshToken });
      const newAccessToken = data?.data?.accessToken ?? data?.accessToken;
      const newRefreshToken = data?.data?.refreshToken ?? data?.refreshToken;
      localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      return newAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = AUTH_ENDPOINT_PATTERN.test(original?.url || '');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const newToken = await refreshSession();
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('actorType');
        window.location.href = '/business/login';
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
