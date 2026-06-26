import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

export const productApi = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.PRODUCTS, { params }),
  getById: (id) => apiClient.get(API_ENDPOINTS.PRODUCT_DETAIL(id)),
  search: (query, params) => apiClient.get(API_ENDPOINTS.SEARCH, { params: { q: query, ...params } }),
  getCategories: (params) => apiClient.get(API_ENDPOINTS.CATEGORIES, { params }),
  getMetals: () => apiClient.get(API_ENDPOINTS.METALS),
};
