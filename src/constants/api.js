export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    LOGOUT: '/auth/logout',
  },

  // Shopkeeper (B2B)
  SHOPKEEPER: {
    LOGIN: '/shopkeeper/auth/login',
    REGISTER: '/shopkeeper/auth/register',
    REFRESH: '/shopkeeper/auth/refresh',
    LOGOUT: '/shopkeeper/auth/logout',
    ME: '/shopkeeper/auth/me',
    PROFILE: '/shopkeeper/profile',
    ORDERS: '/shopkeeper/orders',
    CART: '/shopkeeper/cart',
    PAYMENTS: '/shopkeeper/payments',
    LEDGER: '/shopkeeper/ledger',
    KHATABOOK_LEDGER: '/shopkeeper/khatabook/ledger',
  },

  // Public catalog
  METALS: '/metals',
  METAL_RATES: '/shopkeeper/metal-rates',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug) => `/products/slug/${slug}`,
  SEARCH: '/products/search',
  COLLECTIONS: '/collections',
  BANNERS: '/banners',
};
