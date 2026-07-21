export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug) => `/products/${slug}`,
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
    APPROVAL: '/business/approval',
    CATALOG: '/business/catalog',
    ORDERS: '/business/orders',
    ORDER_DETAIL: (id) => `/business/orders/${id}`,
    KHATABOOK: '/business/khatabook',
    LEDGER: '/business/ledger',
    PAYMENTS: '/business/payments',
    PROFILE: '/business/profile',
  },
};
