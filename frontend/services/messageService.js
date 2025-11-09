import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const messageService = {
  // Get all conversations for user
  getConversations: () => {
    return axios.get(`${API_URL}/messages/conversations`);
  },

  // Get or create conversation with specific user
  getOrCreateConversation: (otherUserId) => {
    return axios.get(`${API_URL}/messages/conversation/${otherUserId}`);
  },

  // Get messages for a conversation
  getMessages: (conversationId) => {
    return axios.get(`${API_URL}/messages/${conversationId}/messages`);
  },

  // Send a message - FIXED: Proper parameter structure
  sendMessage: (messageData) => {
    return axios.post(`${API_URL}/messages/send`, messageData);
  },

  // Mark messages as read
  markAsRead: (conversationId) => {
    return axios.post(`${API_URL}/messages/${conversationId}/read`);
  }
};