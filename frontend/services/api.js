import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const authAPI = {
  login: (credentials) => axios.post(`${API_URL}/auth/login`, credentials),
  signup: (userData) => axios.post(`${API_URL}/auth/signup`, userData),
};

export const userAPI = {
  getProfile: () => axios.get(`${API_URL}/users/me`),
  updateProfile: (data) => axios.put(`${API_URL}/users/me`, data),
  getPublicProfile: (id) => axios.get(`${API_URL}/users/${id}`),
};

export const postsAPI = {
  create: (data) => axios.post(`${API_URL}/posts`, data),
  getAll: (params = {}) => axios.get(`${API_URL}/posts`, { params }),
  getById: (id) => axios.get(`${API_URL}/posts/${id}`),
  update: (id, data) => axios.put(`${API_URL}/posts/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/posts/${id}`),
};

export const requestsAPI = {
  sendRequest: (postId, message) => 
    axios.post(`${API_URL}/posts/${postId}/requests`, { message }),
  getRequests: (postId) => axios.get(`${API_URL}/posts/${postId}/requests`),
  respondToRequest: (postId, requestId, status) =>
    axios.post(`${API_URL}/posts/${postId}/requests/${requestId}/respond`, { status }),
};