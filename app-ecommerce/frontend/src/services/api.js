import axios from 'axios';

// Environment-based API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://api-gateway-ecommerce-demo.apps.cluster-tzfv6.tzfv6.sandbox1862.opentlc.com'
    : 'http://localhost:8080');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth context will be injected here
let authContext = null;

export const setAuthContext = (context) => {
  authContext = context;
};

// Request interceptor to add Keycloak auth token
api.interceptors.request.use(
  (config) => {
    if (authContext && authContext.token) {
      config.headers.Authorization = `Bearer ${authContext.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - trigger Keycloak login
      if (authContext && authContext.keycloak) {
        authContext.keycloak.login();
      }
    }
    return Promise.reject(error);
  }
);

// User API (no auth endpoints - handled by Keycloak)
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (userData) => api.put('/api/users/profile', userData),
  deleteProfile: () => api.delete('/api/users/profile'),
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProduct: (id) => api.get(`/api/products/${id}`),
  searchProducts: (query) => api.get(`/api/products/search?q=${encodeURIComponent(query)}`),
  getCategories: () => api.get('/api/products/categories'),
  getProductsByCategory: (categoryId) => api.get(`/api/products/category/${categoryId}`),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getOrders: () => api.get('/api/orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
};

// Payment API
export const paymentsAPI = {
  createPaymentIntent: (amount) => api.post('/api/payments/intent', { amount }),
  confirmPayment: (paymentIntentId) => api.post(`/api/payments/${paymentIntentId}/confirm`),
  getPaymentMethods: () => api.get('/api/payment-methods'),
  addPaymentMethod: (methodData) => api.post('/api/payment-methods', methodData),
  removePaymentMethod: (methodId) => api.delete(`/api/payment-methods/${methodId}`),
};

// Inventory API
export const inventoryAPI = {
  checkStock: (productId) => api.get(`/api/inventory/${productId}`),
  reserveStock: (productId, quantity) => api.post(`/api/inventory/${productId}/reserve`, { quantity }),
  releaseStock: (reservationId) => api.delete(`/api/inventory/reservations/${reservationId}`),
};

// Recommendations API (New Quarkus service)
export const recommendationsAPI = {
  getUserRecommendations: (userId, limit = 10) => api.get(`/api/recommendations/user/${userId}?limit=${limit}`),
  getSimilarProducts: (productId, limit = 5) => api.get(`/api/recommendations/product/${productId}/similar?limit=${limit}`),
  getPopularProducts: (limit = 20) => api.get(`/api/recommendations/popular?limit=${limit}`),
  trackBehavior: (behaviorData) => api.post('/api/recommendations/track', behaviorData),
  getUserStats: (userId) => api.get(`/api/recommendations/user/${userId}/stats`),
};

// Export the main api instance for custom requests
export default api;