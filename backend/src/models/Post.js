const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  competitionType: {
    type: String,
    required: [true, 'Competition type is required'],
    enum: ['hackathon', 'contest', 'club', 'project', 'other']
  },
  requiredRoles: [{
    role: {
      type: String,
      required: true,
      enum: ['Developer', 'Designer', 'ML Engineer', 'Fullstack', 'Backend', 'Frontend', 'Data Scientist', 'Product Manager']
    },
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  }],
  requiredSkills: [{
    type: String,
    trim: true
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeDomain: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  attachments: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  }],
  interestedCount: {
    type: Number,
    default: 0
  },
  requests: [requestSchema],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'completed', 'expired'],
    default: 'open'
  },
  expireAt: {
    type: Date,
    required: [true, 'Expiry date is required']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
postSchema.index({ collegeDomain: 1, status: 1, createdAt: -1 });
postSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
postSchema.index({ 'requiredRoles.role': 1 });
postSchema.index({ requiredSkills: 1 });
postSchema.index({ creator: 1 });

// Virtual for checking if post is active
postSchema.virtual('isActive').get(function() {
  return this.status === 'open' && this.expireAt > new Date();
});

// Method to add request
postSchema.methods.addRequest = function(userId, message) {
  this.requests.push({ userId, message });
  this.interestedCount = this.requests.length;
  return this.save();
};

// Method to respond to request
postSchema.methods.respondToRequest = function(requestId, status) {
  const request = this.requests.id(requestId);
  if (request) {
    request.status = status;
    if (status === 'accepted') {
      this.members.push(request.userId);
    }
    return this.save();
  }
  throw new Error('Request not found');
};

module.exports = mongoose.model('Post', postSchema);