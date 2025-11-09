const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/conversation/:otherUserId', auth, messageController.getOrCreateConversation);
router.get('/:conversationId/messages', auth, messageController.getMessages);
router.post('/send', auth, messageController.sendMessage);
router.post('/:conversationId/read', auth, messageController.markAsRead);
router.get('/test', (req, res) => {
  res.json({ message: 'Messages API is working!' });
});
module.exports = router;