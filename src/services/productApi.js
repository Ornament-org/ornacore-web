import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/constants/api';

export const productApi = {
  getAll: (params) => apiClient.get(API_ENDPOINTS.PRODUCTS, { params }),
  getBySlug: (slug) => apiClient.get(API_ENDPOINTS.PRODUCT_DETAIL(slug)),
  search: (query, params) => apiClient.get(API_ENDPOINTS.SEARCH, { params: { q: query, ...params } }),
  getCategories: (params) => apiClient.get(API_ENDPOINTS.CATEGORIES, { params }),
  getCategoryTree: (params) => apiClient.get(`${API_ENDPOINTS.CATEGORIES}/tree`, { params }),
  getMetals: () => apiClient.get(API_ENDPOINTS.METALS),
  getMetalRates: () => apiClient.get(API_ENDPOINTS.METAL_RATES),
  getCollections: (params) => apiClient.get(API_ENDPOINTS.COLLECTIONS, { params }),
  getBanners: (params) => apiClient.get(API_ENDPOINTS.BANNERS, { params }),
};
