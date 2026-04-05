const express = require('express');
const router = express.Router();
const orderDetailController = require('../controllers/orderDetail.controller');
const verifyToken = require('../middleware/auth');

// Protected
router.get('/order/:orderId', verifyToken, orderDetailController.getByOrder);
router.get('/:id', verifyToken, orderDetailController.getById);

module.exports = router;
