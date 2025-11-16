import axios from 'axios';
import errorLogger from '../utils/errorLogger';
import debugHelper from '../utils/debugHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log API call in development
  debugHelper.logApiCall(config.method.toUpperCase(), config.url, config.data);
  
  // Add timestamp for performance tracking
  config.metadata = { startTime: Date.now() };
  
  return config;
});

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - response.config.metadata.startTime;
    debugHelper.logApiResponse(response.config.url, response, duration);
    
    return response;
  },
  (error) => {
    // Log API errors
    errorLogger.logApiError(
      error,
      error.config?.url || 'unknown',
      error.config?.method?.toUpperCase() || 'GET'
    );
    
    return Promise.reject(error);
  }
);

// Auth API
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);

// Todo API
export const getTodos = (params) => api.get('/todos', { params });
export const getTodoById = (id) => api.get(`/todos/${id}`);
export const createTodo = (todoData) => api.post('/todos', todoData);
export const updateTodo = (id, todoData) => api.put(`/todos/${id}`, todoData);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);

export default api;
