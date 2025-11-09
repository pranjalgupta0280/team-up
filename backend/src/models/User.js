const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
   email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // This creates an index automatically
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be at least 1'],
    max: [5, 'Year cannot exceed 5']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  roles: [{
    type: String,
    enum: ['Developer', 'Designer', 'ML Engineer', 'Fullstack', 'Backend', 'Frontend', 'Data Scientist', 'Product Manager'],
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  linkedinUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid LinkedIn URL'
    }
  },
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid GitHub URL'
    }
  },
  resumeUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || validator.isURL(v);
      },
      message: 'Please provide a valid resume URL'
    }
  },
  collegeDomain: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: true // Always true - no verification needed
  }
}, {
  timestamps: true
});

// Index for better query performance
// userSchema.index({ email: 1 });
userSchema.index({ collegeDomain: 1, skills: 1 });
userSchema.index({ collegeDomain: 1, roles: 1 });

// Virtual for public profile
userSchema.virtual('publicProfile').get(function() {
  return {
    _id: this._id,
    name: this.name,
    avatarUrl: this.avatarUrl,
    year: this.year,
    branch: this.branch,
    skills: this.skills,
    roles: this.roles,
    bio: this.bio,
    linkedinUrl: this.linkedinUrl,
    githubUrl: this.githubUrl,
    resumeUrl: this.resumeUrl,
    collegeDomain: this.collegeDomain,
    isVerified: this.isVerified
  };
});

// Method to check password
userSchema.methods.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 12);
};

module.exports = mongoose.model('User', userSchema);