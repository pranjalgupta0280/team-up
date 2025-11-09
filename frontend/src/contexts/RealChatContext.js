import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

const RealChatContext = createContext();

export const useRealChat = () => {
  const context = useContext(RealChatContext);
  if (!context) {
    throw new Error('useRealChat must be used within a RealChatProvider');
  }
  return context;
};

export const RealChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to real-time chat server');
        setSocket(newSocket);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from chat server');
      });

      newSocket.on('new_message', (data) => {
        setMessages(prev => [...prev, data.message]);
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === data.message.conversationId 
              ? { ...conv, lastMessage: data.message, updatedAt: new Date() }
              : conv
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      });

      newSocket.on('user_online', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('user_typing', (data) => {
        if (data.isTyping) {
          setTypingUsers(prev => new Set([...prev, data.userId]));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
      });

      newSocket.on('conversation_updated', (data) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === data.conversation._id 
              ? { ...conv, ...data.conversation }
              : conv
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user, socket]);

  const startConversation = async (otherUser) => {
    if (!socket || !user) return null;

    try {
      setLoading(true);
      
      // Join conversation room
      const conversationId = [user._id, otherUser._id].sort().join('_');
      socket.emit('join_conversation', conversationId);
      
      const conversation = {
        id: conversationId,
        otherUser,
        isNew: true
      };

      setActiveConversation(conversation);
      setMessages([]);
      
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

 const sendMessage = async (text, receiverId, conversationId = null) => {
  if (!socket || !text.trim()) {
    console.log('❌ Cannot send: No socket or empty text');
    return;
  }

  console.log('📤 Sending via Socket.IO:', { text, receiverId, conversationId });

  return new Promise((resolve, reject) => {
    // Add timeout for socket response
    const timeout = setTimeout(() => {
      reject(new Error('Socket timeout'));
    }, 5000);

    socket.emit('send_message', {
      conversationId,
      receiverId,
      text: text.trim()
    });

    // Listen for success response
    const handleSuccess = (data) => {
      console.log('✅ Socket message sent:', data);
      clearTimeout(timeout);
      socket.off('new_message', handleSuccess);
      socket.off('message_error', handleError);
      resolve(data);
    };

    const handleError = (error) => {
      console.error('❌ Socket message error:', error);
      clearTimeout(timeout);
      socket.off('new_message', handleSuccess);
      socket.off('message_error', handleError);
      reject(error);
    };

    socket.on('new_message', handleSuccess);
    socket.on('message_error', handleError);
  });
};

  const startTyping = (conversationId) => {
    if (socket && conversationId) {
      socket.emit('typing_start', conversationId);
    }
  };

  const stopTyping = (conversationId) => {
    if (socket && conversationId) {
      socket.emit('typing_stop', conversationId);
    }
  };

  const markAsRead = (messageId, conversationId) => {
    if (socket && messageId && conversationId) {
      socket.emit('mark_message_read', { messageId, conversationId });
    }
  };

  const value = {
    socket,
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    startConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    setActiveConversation,
    setMessages,
    setConversations
  };

  return (
    <RealChatContext.Provider value={value}>
      {children}
    </RealChatContext.Provider>
  );
};