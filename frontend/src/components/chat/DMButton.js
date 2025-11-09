import React from 'react';
import { useNavigate } from 'react-router-dom';

const DMButton = ({ user, size = 'medium' }) => {
  const navigate = useNavigate();

  const buttonSizes = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '8px 16px', fontSize: '14px' },
    large: { padding: '10px 20px', fontSize: '16px' }
  };

  const buttonStyle = {
    ...buttonSizes[size],
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500'
  };

  const handleClick = () => {
    navigate('/messages', { 
      state: { 
        startChatWith: user 
      } 
    });
  };

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
    >
      <span>💬</span>
      Message
    </button>
  );
};

export default DMButton;