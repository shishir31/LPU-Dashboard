import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentService = {
  // Fetch student details by Registration ID
  getStudentByRegistrationId: async (registrationId) => {
    const response = await api.get(`/students/${registrationId}`);
    return response.data;
  },

  // Register a new player (only needs registrationId, name, school)
  registerPlayer: async (playerData) => {
    const response = await api.post('/register', playerData);
    return response.data;
  },

  // Delete a registered player
  deleteRegistration: async (id) => {
    const response = await api.delete(`/registrations/${id}`);
    return response.data;
  },

  // Upload PDF for verification
  uploadPDF: async (formData) => {
    const response = await api.post('/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all registrations (with optional search/status filter)
  getRegistrations: async (params = {}) => {
    const response = await api.get('/registrations', { params });
    return response.data;
  },

  // Get verification results
  getVerificationStatus: async () => {
    const response = await api.get('/verification-status');
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get all uploaded PDFs
  getUploads: async () => {
    const response = await api.get('/uploads');
    return response.data;
  },

  // Delete an upload
  deleteUpload: async (id) => {
    const response = await api.delete(`/uploads/${id}`);
    return response.data;
  },
};

export default api;
