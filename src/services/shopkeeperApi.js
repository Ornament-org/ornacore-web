import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

export const shopkeeperApi = {
  getProfile: () => apiClient.get(API_ENDPOINTS.SHOPKEEPER.PROFILE),
  // Backend route is PATCH /shopkeeper/profile (shopkeeper.routes.js) — this
  // was silently sending PUT, which the route doesn't even exist for.
  updateProfile: (data) => apiClient.patch(API_ENDPOINTS.SHOPKEEPER.PROFILE, data),
  updateAddress: (data) => apiClient.put(`${API_ENDPOINTS.SHOPKEEPER.PROFILE}/address`, data),

  getOrders: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.ORDERS, { params }),
  getOrderById: (id) => apiClient.get(`${API_ENDPOINTS.SHOPKEEPER.ORDERS}/${id}`),
  placeOrder: (data) => apiClient.post(API_ENDPOINTS.SHOPKEEPER.ORDERS, data),

  // Real routes (cart.routes.js): GET /, POST /items, PATCH /items/:id,
  // DELETE /items/:id — there is no bulk-clear endpoint, and item mutations
  // live under /items, not the cart root.
  getCart: () => apiClient.get(API_ENDPOINTS.SHOPKEEPER.CART),
  addToCart: (data) => apiClient.post(`${API_ENDPOINTS.SHOPKEEPER.CART}/items`, data),
  updateCartItem: (itemId, data) => apiClient.patch(`${API_ENDPOINTS.SHOPKEEPER.CART}/items/${itemId}`, data),
  removeFromCart: (itemId) => apiClient.delete(`${API_ENDPOINTS.SHOPKEEPER.CART}/items/${itemId}`),

  getPayments: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.PAYMENTS, { params }),
  getLedger: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.LEDGER, { params }),
  getLedgerSummary: (params) => apiClient.get(`${API_ENDPOINTS.SHOPKEEPER.LEDGER}/summary`, { params }),
  // Read-only view of the same khatabook ledger admin sees on a shop's
  // details page (deliveries + cash/metal collections + running balance),
  // scoped to the authenticated shop automatically.
  getKhatabookLedger: (params) => apiClient.get(API_ENDPOINTS.SHOPKEEPER.KHATABOOK_LEDGER, { params }),
};
