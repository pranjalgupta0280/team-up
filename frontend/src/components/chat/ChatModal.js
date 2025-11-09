import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatModal = ({ isOpen, onClose, otherUser }) => {
  const { user } = useAuth();
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    startConversation,
    loading 
  } = useChat();
  
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && otherUser && user) {
      startConversation(otherUser._id);
    }
  }, [isOpen, otherUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    await sendMessage(messageText, activeConversation.roomId);
    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid #e5e7eb'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        color: 'white',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {otherUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>{otherUser?.name || 'User'}</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>
              {otherUser?.year || 'N/A'} Year • {otherUser?.branch || 'N/A'}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: '#f8fafc'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            margin: 'auto',
            padding: '20px'
          }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No messages yet</p>
            <p style={{ fontSize: '14px' }}>
              Start a conversation with {otherUser?.name || 'this user'}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              style={{
                alignSelf: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                animation: 'fadeIn 0.3s ease-in'
              }}
            >
              <div style={{
                backgroundColor: message.sender._id === user._id ? '#2563eb' : 'white',
                color: message.sender._id === user._id ? 'white' : '#374151',
                padding: '8px 12px',
                borderRadius: '18px',
                fontSize: '14px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                border: message.sender._id === user._id ? 'none' : '1px solid #e5e7eb'
              }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px',
                textAlign: message.sender._id === user._id ? 'right' : 'left',
                padding: '0 4px'
              }}>
                {formatTime(message.createdAt)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#f9fafb'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || loading}
            style={{
              backgroundColor: messageText.trim() && !loading ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 20px',
              cursor: messageText.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              minWidth: '60px'
            }}
          >
            Send
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatModal;