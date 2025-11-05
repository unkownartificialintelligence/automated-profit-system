import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const analytics = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: () => api.get('/analytics/revenue'),
  getTopProducts: () => api.get('/analytics/top-products'),
  getProfitAnalysis: () => api.get('/analytics/profit-analysis'),
};

export const trends = {
  getTrending: (region = 'US') => api.get(`/trends?region=${region}`),
  analyze: (keyword) => api.post('/trends/analyze', { keyword }),
  scanOpportunities: (categories) => api.post('/trends/scan-opportunities', { categories }),
};

export const printful = {
  getCatalog: () => api.get('/printful/catalog'),
  getProducts: () => api.get('/printful/products'),
  getOrders: () => api.get('/printful/orders'),
};

export const automation = {
  getStatus: () => api.get('/automation/status'),
  start: () => api.post('/automation/start'),
  stop: () => api.post('/automation/stop'),
};

export default api;
