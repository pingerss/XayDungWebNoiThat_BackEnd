const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const verifyToken = require('../middleware/auth');
const { verifyCustomer } = require('../middleware/roleAuth');

// Public
router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.post('/forgot-password', customerController.forgotPassword);
router.post('/reset-password', customerController.resetPassword);
router.post('/google', customerController.googleLogin);
router.post('/verify-otp', customerController.verifyOtp);

// Protected - chỉ ROLE_CUSTOMER
router.post('/logout', verifyToken, verifyCustomer, customerController.logout);
router.get('/profile', verifyToken, verifyCustomer, customerController.getProfile);
router.put('/profile', verifyToken, verifyCustomer, customerController.updateProfile);
router.put('/change-password', verifyToken, verifyCustomer, customerController.changePassword);
router.delete('/deactivate', verifyToken, verifyCustomer, customerController.deactivate);

module.exports = router;
