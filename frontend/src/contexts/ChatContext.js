import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const startConversation = async (otherUserId) => {
    if (!user) return null;
    
    setLoading(true);
    
    // Create a unique room ID for the conversation
    const roomId = [user._id, otherUserId].sort().join('_');
    
    const conversation = {
      roomId,
      otherUserId,
      createdAt: new Date()
    };

    setActiveConversation(conversation);
    
    // Load any existing messages for this conversation
    if (!messages[roomId]) {
      setMessages(prev => ({
        ...prev,
        [roomId]: []
      }));
    }
    
    setLoading(false);
    return conversation;
  };

  const sendMessage = async (text, roomId) => {
    if (!text.trim() || !roomId || !user) return;

    const newMessage = {
      _id: Date.now().toString(),
      roomId,
      text: text.trim(),
      sender: {
        _id: user._id,
        name: user.name
      },
      createdAt: new Date()
    };

    // Add the message to the current room
    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage]
    }));

    // Simulate receiving a response after 1 second
    setTimeout(() => {
      const responseMessage = {
        _id: (Date.now() + 1).toString(),
        roomId,
        text: "Thanks for your message! I'm interested in your project. Can you tell me more about the requirements?",
        sender: {
          _id: activeConversation?.otherUserId,
          name: "Team Member"
        },
        createdAt: new Date()
      };
      
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), responseMessage]
      }));
    }, 1000);
  };

  const loadConversationHistory = async (roomId) => {
    if (!roomId) return;
    
    setLoading(true);
    
    // Initialize empty messages for this room if doesn't exist
    if (!messages[roomId]) {
      setMessages(prev => ({
        ...prev,
        [roomId]: []
      }));
    }
    
    setLoading(false);
  };

  const getMessagesForRoom = (roomId) => {
    return messages[roomId] || [];
  };

  const value = {
    socket: null,
    conversations,
    activeConversation,
    messages: activeConversation ? getMessagesForRoom(activeConversation.roomId) : [],
    onlineUsers,
    loading,
    startConversation,
    sendMessage,
    loadConversationHistory,
    setActiveConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};