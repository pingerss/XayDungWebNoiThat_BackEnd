const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const verifyToken = require('../middleware/auth');

// Public
router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.post('/forgot-password', customerController.forgotPassword);
router.post('/reset-password', customerController.resetPassword);
router.post('/google', customerController.googleLogin);
router.get('/verify-email/:token', customerController.verifyEmail);

// Protected
router.post('/logout', verifyToken, customerController.logout);
router.get('/profile', verifyToken, customerController.getProfile);
router.put('/profile', verifyToken, customerController.updateProfile);
router.put('/change-password', verifyToken, customerController.changePassword);
router.delete('/deactivate', verifyToken, customerController.deactivate);

module.exports = router;
