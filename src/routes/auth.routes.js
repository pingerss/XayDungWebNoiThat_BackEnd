const express = require('express');
const router = express.Router();
const { unifiedLogin } = require('../controllers/auth.controller');

// POST /api/auth/login — Login duy nhất cho tất cả role
router.post('/login', unifiedLogin);

module.exports = router;
