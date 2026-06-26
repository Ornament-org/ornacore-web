import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

export const shopkeeperApi = {
  getProfile: () => apiClient.get(API_ENDPOINTS.SHOPKEEPER.PROFILE),
  updateProfile: (data) => apiClient.put(API_ENDPOINTS.SHOPKEEPER.PROFILE, data),

  getOrders: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.ORDERS, { params }),
  placeOrder: (data) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.ORDERS, data),

  getCart: () => apiClient.get(API_ENDPOINTS.SHOPKEEPER.CART),
  addToCart: (data) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.CART, data),
  removeFromCart: (itemId) => apiClient.delete(`${API_ENDPOINTS.SHOPKEEPER.CART}/${itemId}`),
  clearCart: () => apiClient.delete(API_ENDPOINTS.SHOPKEEPER.CART),

  getPayments: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.PAYMENTS, { params }),
  getLedger: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.LEDGER, { params }),
};
