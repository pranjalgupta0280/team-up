import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

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

  // Send a message
  sendMessage: (messageData) => {
    return axios.post(`${API_URL}/messages/send`, messageData);
  },

  // Mark messages as read
  markAsRead: (conversationId) => {
    return axios.post(`${API_URL}/messages/${conversationId}/read`);
  }
};