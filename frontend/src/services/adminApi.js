import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const admin = {
  // Authentication
  login: (email, password) => adminApi.post('/admin/login', { email, password }),

  // Clients
  getClients: () => adminApi.get('/admin/clients'),
  getClient: (id) => adminApi.get(`/admin/clients/${id}`),
  createClient: (clientData) => adminApi.post('/admin/clients', clientData),
  updateClient: (id, updates) => adminApi.put(`/admin/clients/${id}`, updates),
  deleteClient: (id) => adminApi.delete(`/admin/clients/${id}`),

  // Dashboard & Analytics
  getDashboard: () => adminApi.get('/admin/dashboard'),
  getAggregateAnalytics: (days = 30) => adminApi.get(`/admin/analytics/aggregate?days=${days}`),

  // System
  getSystemHealth: () => adminApi.get('/admin/health'),
  getActivity: () => adminApi.get('/admin/activity'),
  getLogs: () => adminApi.get('/admin/logs'),
  createLog: (logData) => adminApi.post('/admin/logs', logData),

  // Team/Members
  getAdmins: () => adminApi.get('/admin/users'),
  createAdmin: (adminData) => adminApi.post('/admin/users', adminData),
  updateAdmin: (id, updates) => adminApi.put(`/admin/users/${id}`, updates),
  deleteAdmin: (id) => adminApi.delete(`/admin/users/${id}`),
};

export default adminApi;
