import api from './api';

export const contractService = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (data) => api.post('/contracts', data),
  update: (id, data) => api.put(`/contracts/${id}`, data),
  renew: (id, data) => api.put(`/contracts/${id}/renew`, data),
  terminate: (id, data) => api.put(`/contracts/${id}/terminate`, data || {}),
  getExpiring: () => api.get('/contracts/expiring'),
  getContractTenants: (id) => api.get(`/contracts/${id}/tenants`),
  getAvailableTenants: () => api.get('/contracts/available-tenants'),
};
