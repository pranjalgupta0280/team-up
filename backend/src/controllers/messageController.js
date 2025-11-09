const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Get or create conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id;

    // Ensure users are from same college
    const otherUser = await User.findById(otherUserId);
    if (!otherUser || otherUser.collegeDomain !== req.user.collegeDomain) {
      return res.status(403).json({ error: 'Cannot message users from other colleges' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    }).populate('participants', 'name avatarUrl year branch');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, otherUserId],
        unreadCounts: new Map([
          [currentUserId.toString(), 0],
          [otherUserId.toString(), 0]
        ])
      });
      await conversation.save();
      
      // Populate participants after save
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatarUrl year branch');
    }

    res.json({ conversation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get user's conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name avatarUrl year branch')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    // Format response with unread counts
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => !p._id.equals(userId));
      return {
        id: conv._id,
        otherUser: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCounts.get(userId.toString()) || 0,
        updatedAt: conv.updatedAt
      };
    });

    res.json({ conversations: formattedConversations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name avatarUrl')
      .populate('receiver', 'name avatarUrl')
      .sort({ createdAt: 1 });

    // Mark messages as delivered
    await Message.updateMany(
      { 
        conversationId, 
        receiver: userId,
        deliveredTo: { $ne: userId }
      },
      { $addToSet: { deliveredTo: userId } }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!text.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let conversation;
    
    if (conversationId) {
      // Existing conversation
      conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.includes(senderId)) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (receiverId) {
      // New conversation
      const otherUser = await User.findById(receiverId);
      if (!otherUser || otherUser.collegeDomain !== req.user.collegeDomain) {
        return res.status(403).json({ error: 'Cannot message users from other colleges' });
      }

      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, receiverId],
          unreadCounts: new Map([
            [senderId.toString(), 0],
            [receiverId.toString(), 0]
          ])
        });
        await conversation.save();
      }
    } else {
      return res.status(400).json({ error: 'Either conversationId or receiverId is required' });
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      receiver: conversation.getOtherParticipant(senderId),
      text: text.trim()
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.unreadCounts.set(
      conversation.getOtherParticipant(senderId).toString(),
      (conversation.unreadCounts.get(conversation.getOtherParticipant(senderId).toString()) || 0) + 1
    );
    await conversation.save();

    // Populate message for response
    await message.populate('sender', 'name avatarUrl');
    await message.populate('receiver', 'name avatarUrl');

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId, 
        receiver: userId,
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    // Reset unread count
    conversation.unreadCounts.set(userId.toString(), 0);
    await conversation.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};