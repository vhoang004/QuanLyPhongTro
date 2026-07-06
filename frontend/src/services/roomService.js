import api from './api';

export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  uploadImages: (id, formData) => api.post(`/rooms/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteImage: (id, imageIndex) => api.delete(`/rooms/${id}/images/${imageIndex}`),
  getStats: () => api.get('/rooms/stats'),
  getStatsByTypes: () => api.get('/rooms/stats/types'),
};
