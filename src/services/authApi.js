import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

export const authApi = {
  // ── B2C / Admin ───────────────────────────────────────────
  // POST /admin/auth/login  body: { email, password }
  login: (credentials) => apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials),

  // POST /admin/auth/register
  register: (data) => apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

  // GET /admin/auth/me
  me: () => apiClient.get(API_ENDPOINTS.AUTH.ME),

  // POST /admin/auth/refresh  body: { refreshToken }
  refresh: (refreshToken) => apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  // POST /admin/auth/logout  body: { refreshToken }
  logout: (refreshToken) => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),

  // POST /admin/auth/change-password
  changePassword: (data) => apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),

  // ── B2B Shopkeeper ────────────────────────────────────────
  // POST /shopkeeper/auth/login  body: { identifier, password }
  shopkeeperLogin: (credentials) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.LOGIN, credentials),

  shopkeeperGoogleLogin: (payload) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.GOOGLE_LOGIN, payload),

  requestShopkeeperOtpLogin: (payload) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.OTP_LOGIN_REQUEST, payload),

  verifyShopkeeperOtpLogin: (payload) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.OTP_LOGIN_VERIFY, payload),

  requestShopkeeperPasswordReset: (payload) =>
    apiClient.post(API_ENDPOINTS.SHOPKEEPER.PASSWORD_RESET_REQUEST, payload),

  verifyShopkeeperPasswordReset: (payload) =>
    apiClient.post(API_ENDPOINTS.SHOPKEEPER.PASSWORD_RESET_VERIFY, payload),

  confirmShopkeeperPasswordReset: (payload) =>
    apiClient.post(API_ENDPOINTS.SHOPKEEPER.PASSWORD_RESET_CONFIRM, payload),

  // POST /shopkeeper/auth/register
  shopkeeperRegister: (data) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.REGISTER, data),

  // GET /shopkeeper/auth/me
  shopkeeperMe: () => apiClient.get(API_ENDPOINTS.SHOPKEEPER.ME),

  // POST /shopkeeper/auth/refresh  body: { refreshToken }
  shopkeeperRefresh: (refreshToken) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.REFRESH, { refreshToken }),

  // POST /shopkeeper/auth/logout  body: { refreshToken }
  shopkeeperLogout: (refreshToken) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.LOGOUT, { refreshToken }),
};
