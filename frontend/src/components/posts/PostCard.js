import React from 'react';
import { Link } from 'react-router-dom';
import DMButton from '../chat/DMButton';

const PostCard = ({ post }) => {
  const timeLeft = new Date(post.expireAt) - new Date();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
          {post.title}
        </h3>
        <span style={{
          backgroundColor: daysLeft < 2 ? '#fef2f2' : daysLeft < 7 ? '#fffbeb' : '#f0fdf4',
          color: daysLeft < 2 ? '#dc2626' : daysLeft < 7 ? '#d97706' : '#16a34a',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
        </span>
      </div>

      <p style={{ color: '#6b7280', marginBottom: '16px', lineHeight: '1.5' }}>
        {post.description}
      </p>

      <div style={{ marginBottom: '12px' }}>
        <span style={{
          display: 'inline-block',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          {post.competitionType}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
          Roles Needed:
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {post.requiredRoles.map((role, index) => (
            <span key={index} style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {role.role} ({role.count})
            </span>
          ))}
        </div>
      </div>

      {post.requiredSkills.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontWeight: '500', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
            Skills:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {post.requiredSkills.map((skill, index) => (
              <span key={index} style={{
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {post.creator.avatarUrl ? (
            <img
              src={post.creator.avatarUrl}
              alt={post.creator.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          ) : (
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#d1d5db',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {post.creator.name.charAt(0)}
            </div>
          )}
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
              {post.creator.name}
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              {post.creator.year} Year • {post.creator.branch}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {post.interestedCount} interested
          </span>
          
          {/* DM Button */}
          <DMButton user={post.creator} size="small" />
          
          <Link
            to={`/posts/${post._id}`}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;