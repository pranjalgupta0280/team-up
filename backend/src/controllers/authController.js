const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// SIMPLIFIED: Accept ANY domain as a college
const extractCollegeDomain = (email) => {
  if (!validator.isEmail(email)) {
    throw new Error('Please provide a valid email address');
  }
  
  const domain = email.split('@')[1];
  
  if (!domain) {
    throw new Error('Invalid email format');
  }
  
  // ACCEPT ANY DOMAIN - no restrictions
  return domain;
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, year, branch } = req.body;

    // Validate college email - ANY domain works!
    let collegeDomain;
    try {
      collegeDomain = extractCollegeDomain(email);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create user - AUTO VERIFIED since no email verification
    const passwordHash = await User.hashPassword(password);
    const user = new User({
      name,
      email,
      passwordHash,
      year,
      branch,
      collegeDomain,
      isVerified: true // Auto-verify all users
    });

    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: user.publicProfile
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.publicProfile
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Remove email verification endpoints
exports.verifyEmail = async (req, res) => {
  res.json({ message: 'Email verification is not required' });
};

exports.forgotPassword = async (req, res) => {
  res.status(400).json({ error: 'Password reset not implemented' });
};

exports.resetPassword = async (req, res) => {
  res.status(400).json({ error: 'Password reset not implemented' });
};