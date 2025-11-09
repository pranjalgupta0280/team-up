const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    unique: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatRoomId: {
    type: String,
    required: true,
    unique: true
  },
  files: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  }
}, {
  timestamps: true
});

teamSchema.index({ members: 1 });
teamSchema.index({ chatRoomId: 1 });

module.exports = mongoose.model('Team', teamSchema);