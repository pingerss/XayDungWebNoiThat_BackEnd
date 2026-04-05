const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const verifyToken = require('../middleware/auth');

// Public
router.post('/login', staffController.login);

// Protected
router.post('/logout', verifyToken, staffController.logout);
router.get('/profile', verifyToken, staffController.getProfile);
router.put('/profile', verifyToken, staffController.updateProfile);
router.put('/change-password', verifyToken, staffController.changePassword);

module.exports = router;
