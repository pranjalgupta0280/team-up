import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealChat } from '../contexts/RealChatContext';
import { useLocation } from 'react-router-dom';
import { messageService } from '../services/messageService';

const Messages = () => {
  const { user } = useAuth();
  const { 
    socket,
    conversations, 
    activeConversation, 
    messages, 
    onlineUsers,
    typingUsers,
    sendMessage,
    startConversation,
    startTyping,
    stopTyping,
    markAsRead,
    setActiveConversation,
    setMessages,
    setConversations
  } = useRealChat();
  
  const location = useLocation();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get user data from navigation state if starting a new chat
  const userToStartChatWith = location.state?.startChatWith;

  useEffect(() => {
    loadConversations();
    
    if (userToStartChatWith) {
      handleStartNewChat(userToStartChatWith);
    }
  }, [userToStartChatWith, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    if (activeConversation && activeConversation.id) {
      loadMessages(activeConversation.id);
      markConversationAsRead(activeConversation.id);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await messageService.markAsRead(conversationId);
      // Update local conversations to reflect read status
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleStartNewChat = async (otherUser) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await messageService.getOrCreateConversation(otherUser._id);
      const conversation = response.data.conversation;
      
      const enrichedConversation = {
        id: conversation._id,
        otherUser: conversation.participants.find(p => !p._id.equals(user._id)),
        lastMessage: conversation.lastMessage,
        unreadCount: 0,
        updatedAt: conversation.updatedAt
      };

      // Join socket room
      if (socket) {
        socket.emit('join_conversation', conversation._id);
      }

      setActiveConversation(enrichedConversation);
      
      // Clear navigation state
      window.history.replaceState({}, document.title);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    
    // Join socket room
    if (socket) {
      socket.emit('join_conversation', conversation.id);
    }
  };

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !activeConversation || !user) {
    console.log('❌ Cannot send: Missing required data');
    return;
  }

  console.log('🔄 Attempting to send message:', {
    text: newMessage.trim(),
    conversationId: activeConversation.id,
    receiverId: activeConversation.otherUser._id
  });

  // Stop typing indicator
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }
  setIsTyping(false);
  
  if (socket) {
    stopTyping(activeConversation.id);
  }

  try {
    // Method 1: Try via HTTP API first (more reliable)
    const messageData = {
      text: newMessage.trim(),
      receiverId: activeConversation.otherUser._id,
      conversationId: activeConversation.id || undefined
    };

    console.log('📤 Sending via HTTP API:', messageData);
    
    const response = await messageService.sendMessage(messageData);
    console.log('✅ Message sent successfully:', response.data);

    // Clear input immediately for better UX
    setNewMessage('');

    // Reload messages to see the new one
    if (activeConversation.id) {
      loadMessages(activeConversation.id);
    }

    // Reload conversations to update last message
    loadConversations();

  } catch (error) {
    console.error('❌ Failed to send message via HTTP:', error);
    
    // Fallback: Try via Socket.IO
    if (socket) {
      console.log('🔄 Trying fallback: Socket.IO');
      try {
        await sendMessage(
          newMessage.trim(),
          activeConversation.otherUser._id,
          activeConversation.id
        );
        setNewMessage('');
      } catch (socketError) {
        console.error('❌ Failed to send via Socket.IO:', socketError);
        alert('Failed to send message. Please try again.');
      }
    } else {
      alert('Failed to send message. Please check your connection.');
    }
  }
};

  const handleTyping = () => {
    if (!activeConversation || !socket) return;

    if (!isTyping) {
      setIsTyping(true);
      startTyping(activeConversation.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeConversation.id);
    }, 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return messageDate.toLocaleDateString();
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const isUserTyping = (userId) => {
    return typingUsers.has(userId);
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 200px)', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Conversations List */}
      <div style={{ width: '350px', borderRight: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Messages</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Chat with your teammates</p>
        </div>

        <div style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p>No conversations yet</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Start a conversation by messaging someone</p>
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  backgroundColor: activeConversation?.id === conversation.id ? '#dbeafe' : 'white',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseOver={(e) => {
                  if (activeConversation?.id !== conversation.id) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeConversation?.id !== conversation.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#2563eb',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {conversation.otherUser.name.charAt(0)}
                  </div>
                  {isUserOnline(conversation.otherUser._id) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#10b981',
                      border: '2px solid white',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {conversation.otherUser.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#6b7280', flexShrink: 0 }}>
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>

                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {conversation.lastMessage?.text || 'No messages yet'}
                  </p>

                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    {conversation.otherUser.year} Year • {conversation.otherUser.branch}
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'white'
            }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#2563eb',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {activeConversation.otherUser.name.charAt(0)}
                </div>
                {isUserOnline(activeConversation.otherUser._id) && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#10b981',
                    border: '2px solid white',
                    borderRadius: '50%'
                  }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  {activeConversation.otherUser.name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>
                  {activeConversation.otherUser.year} Year • {activeConversation.otherUser.branch}
                  {isUserTyping(activeConversation.otherUser._id) && (
                    <span style={{ color: '#2563eb', marginLeft: '8px' }}>typing...</span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              padding: '20px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#f8fafc'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  margin: 'auto',
                  padding: '40px'
                }}>
                  <p style={{ fontSize: '18px', marginBottom: '8px' }}>No messages yet</p>
                  <p>Start a conversation with {activeConversation.otherUser.name}</p>
                </div>
              ) : (
                <>
                  {messages.map(message => (
                    <div
                      key={message._id}
                      style={{
                        alignSelf: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        animation: 'fadeIn 0.3s ease-in'
                      }}
                    >
                      <div style={{
                        backgroundColor: message.sender._id === user._id ? '#2563eb' : 'white',
                        color: message.sender._id === user._id ? 'white' : '#374151',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        fontSize: '14px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        border: message.sender._id === user._id ? 'none' : '1px solid #e5e7eb'
                      }}>
                        {message.text}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '4px',
                        textAlign: message.sender._id === user._id ? 'right' : 'left',
                        padding: '0 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start'
                      }}>
                        {formatTime(message.createdAt)}
                        {message.sender._id === user._id && (
                          <>
                            {message.readBy && message.readBy.length > 0 ? (
                              <span style={{ color: '#10b981' }}>✓✓</span>
                            ) : message.deliveredTo && message.deliveredTo.length > 0 ? (
                              <span style={{ color: '#6b7280' }}>✓✓</span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>✓</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isUserTyping(activeConversation.otherUser._id) && (
                    <div style={{
                      alignSelf: 'flex-start',
                      maxWidth: '70%',
                      animation: 'fadeIn 0.3s ease-in'
                    }}>
                      <div style={{
                        backgroundColor: 'white',
                        color: '#374151',
                        padding: '12px 16px',
                        borderRadius: '18px',
                        fontSize: '14px',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#6b7280',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#6b7280',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '0.2s'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#6b7280',
                          borderRadius: '50%',
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '0.4s'
                        }}></div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{ 
              padding: '20px', 
              borderTop: '1px solid #e5e7eb',
              backgroundColor: 'white'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={`Message ${activeConversation.otherUser.name}...`}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '24px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#f9fafb'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    backgroundColor: newMessage.trim() ? '#2563eb' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '12px 24px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500',
                    minWidth: '80px'
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                Your Messages
              </h3>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Messages;