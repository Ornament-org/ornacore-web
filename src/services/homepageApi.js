import apiClient from './apiClient';

export const homepageApi = {
  getHomepage: (params = {}) => apiClient.get('/homepage', { params }),
};
