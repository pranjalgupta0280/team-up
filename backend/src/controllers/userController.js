const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const validator = require('validator');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.publicProfile });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['name', 'year', 'branch', 'skills', 'roles', 'bio', 'linkedinUrl', 'githubUrl'];
    
    // Filter only allowed updates
    const filteredUpdates = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // Validate URLs if provided
    if (filteredUpdates.linkedinUrl && !validator.isURL(filteredUpdates.linkedinUrl)) {
      return res.status(400).json({ error: 'Invalid LinkedIn URL' });
    }

    if (filteredUpdates.githubUrl && !validator.isURL(filteredUpdates.githubUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub URL' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    res.json({ user: user.publicProfile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.path, 'teamup/avatars');
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: result.secure_url },
      { new: true }
    );

    res.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if file is PDF
    if (!req.file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const result = await uploadToCloudinary(req.file.path, 'teamup/resumes');
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl: result.secure_url },
      { new: true }
    );

    res.json({ resumeUrl: user.resumeUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload resume' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatarUrl year branch skills roles bio linkedinUrl githubUrl resumeUrl collegeDomain isVerified');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.publicProfile });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};