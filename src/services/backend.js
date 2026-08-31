import api from './api';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (data) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const apiKeyApi = {
  list: () => api.get('/api-keys'),
  create: (data) => api.post('/api-keys', data),
  update: (id, data) => api.put(`/api-keys/${id}`, data),
  delete: (id) => api.delete(`/api-keys/${id}`),
  toggle: (id) => api.patch(`/api-keys/${id}/toggle`),
  test: (id) => api.post(`/api-keys/${id}/test`),
};

export const promptApi = {
  optimize: (data) => api.post('/prompts/optimize', data),
  history: (page = 0, size = 20) => api.get(`/prompts/history?page=${page}&size=${size}`),
  toggleFavorite: (id) => api.patch(`/prompts/history/${id}/favorite`),
  deleteHistory: (id) => api.delete(`/prompts/history/${id}`),
};
