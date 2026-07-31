const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');

const withApiPrefix = (baseUrl) => {
  const normalized = trimTrailingSlashes(baseUrl);
  return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
};

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
const HOSTED_API_ORIGIN = 'https://backend.wolfan.jipanditji.com';

const isLocalUrl = (value) => {
  try {
    return LOCAL_HOSTNAMES.has(new URL(value).hostname);
  } catch {
    return false;
  }
};

const inferBrowserApiOrigin = () => {
  if (typeof window === 'undefined') return '';
  const { hostname } = window.location;
  if (LOCAL_HOSTNAMES.has(hostname)) return '';
  if (hostname === 'wolfan.jipanditji.com' || hostname.endsWith('.wolfan.jipanditji.com')) {
    return HOSTED_API_ORIGIN;
  }
  return '';
};

const configuredApiOrigin = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
);
const browserApiOrigin = inferBrowserApiOrigin();
const shouldUseHostedApi = isLocalUrl(configuredApiOrigin)
  && (Boolean(browserApiOrigin) || process.env.NODE_ENV === 'production');

export const API_ORIGIN = shouldUseHostedApi
  ? (browserApiOrigin || HOSTED_API_ORIGIN)
  : configuredApiOrigin;
export const API_BASE_URL = withApiPrefix(API_ORIGIN);
export const HOSTED_API_BASE_URL = withApiPrefix(HOSTED_API_ORIGIN);
export const USES_LOCAL_API = isLocalUrl(API_ORIGIN);

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
    REGISTRATION_EMAIL_OTP_REQUEST: '/shopkeeper/auth/registration-email-otp/request',
    REGISTRATION_EMAIL_OTP_VERIFY: '/shopkeeper/auth/registration-email-otp/verify',
    GOOGLE_LOGIN: '/shopkeeper/auth/google-login',
    OTP_LOGIN_REQUEST: '/shopkeeper/auth/otp-login/request',
    OTP_LOGIN_VERIFY: '/shopkeeper/auth/otp-login/verify',
    PASSWORD_RESET_REQUEST: '/shopkeeper/auth/password-reset/request',
    PASSWORD_RESET_VERIFY: '/shopkeeper/auth/password-reset/verify',
    PASSWORD_RESET_CONFIRM: '/shopkeeper/auth/password-reset/confirm',
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
