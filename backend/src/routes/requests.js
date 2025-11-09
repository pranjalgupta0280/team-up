const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth } = require('../middleware/auth');

router.post('/:id/requests', auth, requestController.sendJoinRequest);
router.get('/:id/requests', auth, requestController.getRequests);
router.post('/:id/requests/:requestId/respond', auth, requestController.respondToRequest);

module.exports = router;