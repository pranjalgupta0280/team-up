import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    branch: '',
    bio: '',
    skills: [],
    roles: [],
    linkedinUrl: '',
    githubUrl: '',
    resumeUrl: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Available roles for selection
  const availableRoles = [
    'Developer',
    'Designer', 
    'ML Engineer',
    'Fullstack',
    'Backend',
    'Frontend',
    'Data Scientist',
    'Product Manager'
  ];

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        year: user.year || '',
        branch: user.branch || '',
        bio: user.bio || '',
        skills: user.skills || [],
        roles: user.roles || [],
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        resumeUrl: user.resumeUrl || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleRoleToggle = (role) => {
    const currentRoles = formData.roles || [];
    if (currentRoles.includes(role)) {
      setFormData({
        ...formData,
        roles: currentRoles.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        roles: [...currentRoles, role]
      });
    }
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await userAPI.updateProfile(formData);
      setMessage('Profile updated successfully!');
      // You might want to update the user context here
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const response = await userAPI.uploadResume(formData);
      setFormData(prev => ({
        ...prev,
        resumeUrl: response.data.resumeUrl
      }));
      setMessage('Resume uploaded successfully!');
    } catch (error) {
      setError('Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Your Profile</h2>
      
      {message && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          border: '1px solid #a7f3d0', 
          color: '#065f46',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Branch/Department</label>
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., Computer Science, Electrical Engineering"
            />
          </div>
        </div>

        {/* About Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">About Me</h3>
          <div className="form-group">
            <label className="form-label">Bio/Description</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-input"
              placeholder="Tell others about yourself, your interests, projects, and what you're looking for..."
              rows="4"
              style={{ resize: 'vertical' }}
              maxLength="500"
            />
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
              {formData.bio.length}/500 characters
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Skills</h3>
          <div className="form-group">
            <label className="form-label">Add Skills</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleSkillKeyPress}
                className="form-input"
                placeholder="e.g., React, Python, UI/UX Design"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
          </div>

          {/* Skills Display */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {formData.skills.map((skill, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#3730a3',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Roles Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Preferred Roles</h3>
          <p style={{ color: '#6b7280', marginBottom: '12px' }}>
            Select the roles you're interested in or comfortable with
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
            {availableRoles.map((role) => (
              <label
                key={role}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  border: formData.roles.includes(role) ? '2px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: formData.roles.includes(role) ? '#dbeafe' : 'white',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  style={{ display: 'none' }}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Social Links</h3>
          
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://github.com/yourusername"
            />
          </div>
        </div>

        {/* Resume Upload */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Resume</h3>
          
          {formData.resumeUrl ? (
            <div>
              <p style={{ marginBottom: '12px' }}>
                Resume uploaded: 
                <a 
                  href={formData.resumeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', marginLeft: '8px' }}
                >
                  View Resume
                </a>
              </p>
            </div>
          ) : (
            <p style={{ color: '#6b7280', marginBottom: '12px' }}>
              No resume uploaded yet
            </p>
          )}

          <div className="form-group">
            <label className="form-label">Upload Resume (PDF only)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="form-input"
              style={{ padding: '8px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Updating Profile...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;