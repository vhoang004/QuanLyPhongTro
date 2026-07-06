import api from './api';

export const debtService = {
  getAll: (params) => api.get('/debts', { params }),
  getSummary: (params) => api.get('/debts/summary', { params }),
  getDetails: (id) => api.get(`/debts/${id}`),
  createAdjustment: (data) => api.post('/debts/adjustments', data),
  deleteAdjustment: (id) => api.delete(`/debts/adjustments/${id}`),
};
