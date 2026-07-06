import api from './api';

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  generate: (data) => api.post('/invoices', data),
  generateBatch: (data) => api.post('/invoices/batch', data),
  generateQR: (id) => api.post(`/invoices/${id}/qr`),
  sendEmail: (id) => api.post(`/dashboard/send-email/${id}`),
};

export const dashboardService = {
  exportPDF: (id) => api.get(`/dashboard/export-pdf/${id}`, { responseType: 'blob' }),
  sendEmail: (id) => api.post(`/dashboard/send-email/${id}`),
};

export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  getByInvoice: (invoiceId) => api.get(`/payments/invoice/${invoiceId}`),
  create: (data) => api.post('/payments', data),
  confirm: (id, data) => api.post(`/payments/confirm/${id}`, data || {}),
};

export const meterReadingService = {
  getAll: (params) => api.get('/meter-readings', { params }),
  getByRoom: (roomId) => api.get(`/meter-readings/room/${roomId}`),
  getServices: () => api.get('/meter-readings/services'),
  getRoomsForReading: (params) => api.get('/meter-readings/rooms', { params }),
  create: (data) => api.post('/meter-readings', data),
  createBatch: (data) => api.post('/meter-readings/batch', data),
};

export const ownerConfigService = {
  get: () => api.get('/owner-config'),
  update: (data) => api.put('/owner-config', data),
};
