const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const verifyToken = require('../middleware/auth');

// Public
router.get('/tracking/:trackingNumber', orderController.tracking);

// Protected
router.post('/', verifyToken, orderController.create);
router.get('/', verifyToken, orderController.getMyOrders);
router.get('/:id', verifyToken, orderController.getById);
router.get('/:id/status', verifyToken, orderController.getStatus);
router.put('/:id/cancel', verifyToken, orderController.cancel);
router.post('/:id/confirm', verifyToken, orderController.confirm);
router.post('/:id/reorder', verifyToken, orderController.reorder);

module.exports = router;
