import apiClient from './apiClient';

export const brandingApi = {
  getBranding: () => apiClient.get('/store-settings/branding'),
};
