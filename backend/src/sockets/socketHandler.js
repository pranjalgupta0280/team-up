const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const connectedUsers = new Map();

const authenticateSocket = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
};

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const user = await authenticateSocket(token);
      if (!user) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user._id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User ${socket.user.name} connected`);
    
    // Store user connection
    connectedUsers.set(socket.userId.toString(), socket.id);
    
    // Broadcast online status
    socket.broadcast.emit('user_online', socket.userId);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.user.name} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, text } = data;

        // Create message in database
        const Message = require('../models/Message');
        const Conversation = require('../models/Conversation');
        
        let conversation;
        
        if (conversationId) {
          conversation = await Conversation.findById(conversationId);
        } else if (receiverId) {
          // Find or create conversation
          conversation = await Conversation.findOne({
            participants: { $all: [socket.userId, receiverId] }
          });
          
          if (!conversation) {
            conversation = new Conversation({
              participants: [socket.userId, receiverId],
              unreadCounts: new Map([
                [socket.userId.toString(), 0],
                [receiverId.toString(), 0]
              ])
            });
            await conversation.save();
          }
        }

        const message = new Message({
          conversationId: conversation._id,
          sender: socket.userId,
          receiver: conversation.getOtherParticipant(socket.userId),
          text: text.trim()
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.unreadCounts.set(
          conversation.getOtherParticipant(socket.userId).toString(),
          (conversation.unreadCounts.get(conversation.getOtherParticipant(socket.userId).toString()) || 0) + 1
        );
        await conversation.save();

        // Populate message for emission
        await message.populate('sender', 'name avatarUrl');
        await message.populate('receiver', 'name avatarUrl');

        // Emit to conversation room
        io.to(`conversation_${conversation._id}`).emit('new_message', {
          message: message.toObject()
        });

        // Emit to receiver's personal room if online
        const receiverSocketId = connectedUsers.get(conversation.getOtherParticipant(socket.userId).toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message_delivered', {
            messageId: message._id,
            conversationId: conversation._id
          });
        }

        // Update conversations list for both users
        const conversationsUpdate = await Conversation.findById(conversation._id)
          .populate('participants', 'name avatarUrl year branch')
          .populate('lastMessage');

        io.to(`conversation_${conversation._id}`).emit('conversation_updated', {
          conversation: conversationsUpdate
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping: false
      });
    });

    // Handle message read receipts
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        
        const message = await Message.findById(messageId);
        if (message && !message.readBy.includes(socket.userId)) {
          message.readBy.push(socket.userId);
          await message.save();

          // Notify sender
          socket.to(`conversation_${conversationId}`).emit('message_read', {
            messageId,
            userId: socket.userId,
            userName: socket.user.name
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.user.name} disconnected`);
      connectedUsers.delete(socket.userId.toString());
      socket.broadcast.emit('user_offline', socket.userId);
    });
  });
};

module.exports = { setupSocket, connectedUsers };