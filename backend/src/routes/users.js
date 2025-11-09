const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.post('/me/avatar', auth, upload.single('avatar'), userController.uploadAvatar);
router.post('/me/resume', auth, upload.single('resume'), userController.uploadResume);
router.get('/:id', auth, userController.getPublicProfile);

// No wildcard routes here either
module.exports = router;