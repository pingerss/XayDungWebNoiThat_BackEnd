const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const verifyToken = require('../middleware/auth');
const { verifyStaff } = require('../middleware/roleAuth');

// Protected - chỉ ROLE_STAFF hoặc ROLE_ADMIN
router.post('/logout', verifyToken, verifyStaff, staffController.logout);
router.get('/profile', verifyToken, verifyStaff, staffController.getProfile);
router.put('/profile', verifyToken, verifyStaff, staffController.updateProfile);
router.put('/change-password', verifyToken, verifyStaff, staffController.changePassword);

module.exports = router;
