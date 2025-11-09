import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Find Your Perfect Team
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with students from your college for hackathons, projects, and coding competitions
        </p>
        
        {isAuthenticated ? (
          <div className="space-x-4">
            <Link
              to="/posts"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Find Teams
            </Link>
            <Link
              to="/create-post"
              className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700"
            >
              Create Post
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50"
            >
              Login
            </Link>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">College-Only</h3>
            <p className="text-gray-600">
              Connect only with students from your college using your college email
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Find Teammates</h3>
            <p className="text-gray-600">
              Discover students with the skills you need for your projects
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-2xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
            <p className="text-gray-600">
              Communicate with your team through built-in chat functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;