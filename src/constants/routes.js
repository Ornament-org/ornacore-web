export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id) => `/products/${id}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (slug) => `/categories/${slug}`,
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (id) => `/orders/${id}`,
  PROFILE: '/profile',

  // B2B
  BUSINESS: {
    LOGIN: '/business/login',
    REGISTER: '/business/register',
    DASHBOARD: '/business/dashboard',
    CATALOG: '/business/catalog',
    ORDERS: '/business/orders',
    ORDER_DETAIL: (id) => `/business/orders/${id}`,
    KHATABOOK: '/business/khatabook',
    LEDGER: '/business/ledger',
    PAYMENTS: '/business/payments',
    PROFILE: '/business/profile',
  },
};
