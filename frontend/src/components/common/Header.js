import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold header-link">TeamUp</Link>
        
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="header-link">Dashboard</Link>
              <Link to="/posts" className="header-link">Find Teams</Link>
              <Link to="/messages" className="header-link">Messages</Link>
              <Link to="/my-posts" className="header-link">My Posts</Link>
              <Link to="/profile" className="header-link">Profile</Link>
              <div className="flex items-center gap-4">
                <span>Hello, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#1e40af' }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="header-link">Login</Link>
              <Link 
                to="/signup" 
                className="btn"
                style={{ backgroundColor: 'white', color: '#2563eb' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;