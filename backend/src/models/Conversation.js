const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure unique conversations between users
conversationSchema.index({ participants: 1 }, { unique: true });

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(participant => !participant.equals(userId));
};

module.exports = mongoose.model('Conversation', conversationSchema);