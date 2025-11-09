import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const response = await postsAPI.getAll({ limit: 3 });
        setRecentPosts(response.data.posts);
      } catch (error) {
        console.error('Failed to load recent posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentPosts();
  }, []);

  if (!user) {
    return <div className="loading-spinner"></div>;
  }

  const formatTimeLeft = (expireAt) => {
    const timeLeft = new Date(expireAt) - new Date();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 1) return '1 day left';
    if (daysLeft < 7) return `${daysLeft} days left`;
    return 'Active';
  };

  return (
    <div>
      <div className="card mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          Here's your profile overview and recent team opportunities
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Overview */}
        <div className="lg:col-span-2">
          {/* Recent Posts Section */}
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Team Opportunities</h2>
              <Link to="/posts" className="text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="loading-spinner"></div>
            ) : recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <div
                    key={post._id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      transition: 'all 0.2s'
                    }}
                    className="hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                      <span
                        style={{
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {formatTimeLeft(post.expireAt)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.requiredRoles.slice(0, 3).map((role, index) => (
                        <span
                          key={index}
                          style={{
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {role.role} ({role.count})
                        </span>
                      ))}
                      {post.requiredRoles.length > 3 && (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          +{post.requiredRoles.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}
                        >
                          {post.creator.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.creator.name}</p>
                          <p className="text-xs text-gray-500">
                            {post.creator.year} Year • {post.creator.branch}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className="text-sm text-gray-500">
                          {post.interestedCount} interested
                        </span>
                        <Link
                          to={`/posts/${post._id}`}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No team posts available yet.</p>
                <Link to="/create-post" className="btn btn-primary">
                  Create First Post
                </Link>
              </div>
            )}
          </div>

          {/* ... Rest of your existing profile code remains the same ... */}
          {/* Keep all the existing profile sections below */}
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/create-post"
                className="btn btn-primary w-full text-center"
              >
                Create Team Post
              </Link>
              <Link
                to="/posts"
                className="btn btn-secondary w-full text-center"
              >
                Find Teams
              </Link>
              <Link
                to="/profile"
                className="btn"
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  width: '100%',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* ... Rest of your existing right column code ... */}
        </div>
      </div>

      {/* ... Rest of your existing dashboard code ... */}
    </div>
  );
};

export default Dashboard;