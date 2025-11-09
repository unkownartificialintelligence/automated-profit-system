import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const marketingApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
marketingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const marketing = {
  // Dashboard & Analytics
  getDashboard: () => marketingApi.get('/marketing/dashboard'),
  getPerformance: (days = 30) => marketingApi.get(`/marketing/analytics/performance?days=${days}`),

  // Contacts
  getContacts: (type, status) => {
    let url = '/marketing/contacts?';
    if (type) url += `type=${type}&`;
    if (status) url += `status=${status}&`;
    return marketingApi.get(url);
  },
  createContact: (contactData) => marketingApi.post('/marketing/contacts', contactData),
  updateContact: (id, updates) => marketingApi.put(`/marketing/contacts/${id}`, updates),
  deleteContact: (id) => marketingApi.delete(`/marketing/contacts/${id}`),

  // Campaigns
  getCampaigns: (status, type) => {
    let url = '/marketing/campaigns?';
    if (status) url += `status=${status}&`;
    if (type) url += `type=${type}&`;
    return marketingApi.get(url);
  },
  getCampaign: (id) => marketingApi.get(`/marketing/campaigns/${id}`),
  createCampaign: (campaignData) => marketingApi.post('/marketing/campaigns', campaignData),
  updateCampaign: (id, updates) => marketingApi.put(`/marketing/campaigns/${id}`, updates),
  launchCampaign: (id) => marketingApi.post(`/marketing/campaigns/${id}/launch`),
  pauseCampaign: (id) => marketingApi.post(`/marketing/campaigns/${id}/pause`),

  // Templates
  getTemplates: (category, audience) => {
    let url = '/marketing/templates?';
    if (category) url += `category=${category}&`;
    if (audience) url += `audience=${audience}&`;
    return marketingApi.get(url);
  },
  getTemplate: (id) => marketingApi.get(`/marketing/templates/${id}`),
  createTemplate: (templateData) => marketingApi.post('/marketing/templates', templateData),
  updateTemplate: (id, updates) => marketingApi.put(`/marketing/templates/${id}`, updates),

  // Partnerships
  getPartnerships: (type, status) => {
    let url = '/marketing/partnerships?';
    if (type) url += `type=${type}&`;
    if (status) url += `status=${status}&`;
    return marketingApi.get(url);
  },
  createPartnership: (partnershipData) => marketingApi.post('/marketing/partnerships', partnershipData),
  updatePartnership: (id, updates) => marketingApi.put(`/marketing/partnerships/${id}`, updates),

  // Workflows
  getWorkflows: () => marketingApi.get('/marketing/workflows'),
  createWorkflow: (workflowData) => marketingApi.post('/marketing/workflows', workflowData),
  toggleWorkflow: (id) => marketingApi.put(`/marketing/workflows/${id}/toggle`),
};

export default marketingApi;
