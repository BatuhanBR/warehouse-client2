import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// İstek log
api.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url, request.data);
  return request;
});

// Yanıt log
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Sadece auth ile ilgili servisleri tutalım
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export default api; 