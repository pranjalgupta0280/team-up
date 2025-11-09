import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../../services/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    competitionType: '',
    requiredRoles: [{ role: '', count: 1 }],
    requiredSkills: [],
    location: '',
    expireAt: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const competitionTypes = [
    'hackathon',
    'contest',
    'project',
    'club',
    'other'
  ];

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...formData.requiredRoles];
    updatedRoles[index][field] = value;
    setFormData({
      ...formData,
      requiredRoles: updatedRoles
    });
  };

  const addRole = () => {
    setFormData({
      ...formData,
      requiredRoles: [...formData.requiredRoles, { role: '', count: 1 }]
    });
  };

  const removeRole = (index) => {
    if (formData.requiredRoles.length > 1) {
      const updatedRoles = formData.requiredRoles.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        requiredRoles: updatedRoles
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        requiredSkills: [...formData.requiredSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      requiredSkills: formData.requiredSkills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validate required roles
    const hasEmptyRoles = formData.requiredRoles.some(role => !role.role);
    if (hasEmptyRoles) {
      setError('Please select a role for all required positions');
      setLoading(false);
      return;
    }

    try {
      const postData = {
        ...formData,
        requiredRoles: JSON.stringify(formData.requiredRoles),
        requiredSkills: JSON.stringify(formData.requiredSkills),
        expireAt: new Date(formData.expireAt).toISOString()
      };

      const response = await postsAPI.create(postData);
      setMessage('Post created successfully!');
      
      // Redirect to posts page after 2 seconds
      setTimeout(() => {
        navigate('/posts');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-2xl font-bold text-center mb-6">Create Team Post</h2>
      
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
          
          <div className="form-group">
            <label className="form-label">Post Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., Need React Developer for Hackathon"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Describe your project, what you're looking for, team goals, etc..."
              rows="5"
              style={{ resize: 'vertical' }}
              maxLength="2000"
            />
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
              {formData.description.length}/2000 characters
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Competition Type *</label>
              <select
                name="competitionType"
                value={formData.competitionType}
                onChange={handleChange}
                required
                className="form-input"
              >
                <option value="">Select Type</option>
                {competitionTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location (Optional)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Online, Campus Lab, Remote"
              />
            </div>
          </div>
        </div>

        {/* Required Roles */}
        <div style={{ marginBottom: '24px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Required Team Roles *</h3>
            <button
              type="button"
              onClick={addRole}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              + Add Role
            </button>
          </div>

          {formData.requiredRoles.map((role, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'end', marginBottom: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  value={role.role}
                  onChange={(e) => handleRoleChange(index, 'role', e.target.value)}
                  required
                  className="form-input"
                >
                  <option value="">Select Role</option>
                  {availableRoles.map(availableRole => (
                    <option key={availableRole} value={availableRole}>
                      {availableRole}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Count</label>
                <select
                  value={role.count}
                  onChange={(e) => handleRoleChange(index, 'count', parseInt(e.target.value))}
                  className="form-input"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => removeRole(index)}
                  disabled={formData.requiredRoles.length === 1}
                  style={{
                    backgroundColor: formData.requiredRoles.length === 1 ? '#9ca3af' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px',
                    cursor: formData.requiredRoles.length === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Required Skills */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Preferred Skills</h3>
          
          <div className="form-group">
            <label className="form-label">Add Skills (Optional)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="form-input"
                placeholder="e.g., React, Python, Figma"
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
          {formData.requiredSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {formData.requiredSkills.map((skill, index) => (
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
          )}
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: '24px' }}>
          <h3 className="text-xl font-semibold mb-4">Timeline</h3>
          
          <div className="form-group">
            <label className="form-label">Application Deadline *</label>
            <input
              type="datetime-local"
              name="expireAt"
              value={formData.expireAt}
              onChange={handleChange}
              required
              className="form-input"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              When should people stop applying to join your team?
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Creating Post...' : 'Create Post'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/posts')}
            className="btn"
            style={{ 
              backgroundColor: '#f3f4f6', 
              color: '#374151',
              flex: 1
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;