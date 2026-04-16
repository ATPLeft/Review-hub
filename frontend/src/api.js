import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Reviews
export const getProductReviews = (productId) => api.get(`/products/${productId}/reviews`);
export const createReview = (data) => api.post('/reviews', data);
export const getMyReviews = () => api.get('/users/me/reviews');

// Moderation
export const getPendingReviews = () => api.get('/moderation/pending');
export const updateReviewStatus = (reviewId, status) =>
  api.patch(`/moderation/reviews/${reviewId}`, { status });

// Analytics
export const getTopProducts = () => api.get('/analytics/top-products');
export const getSentiment = () => api.get('/analytics/sentiment');

export default api;
