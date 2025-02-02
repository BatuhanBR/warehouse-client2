import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const authService = {
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },
  
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },
  
  forgotPassword: async (data) => {
    return api.post('/auth/forgot-password', data);
  }
};

export default api; 