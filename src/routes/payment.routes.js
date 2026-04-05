const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth');

// Public (VNPay callbacks)
router.get('/vnpay/callback', paymentController.vnpayCallback);
router.get('/vnpay/return', paymentController.vnpayReturn);

// Protected
router.post('/vnpay/create', verifyToken, paymentController.createVnpay);
router.get('/:id/status', verifyToken, paymentController.getStatus);
router.get('/order/:orderId', verifyToken, paymentController.getByOrder);
router.post('/cod/confirm', verifyToken, paymentController.confirmCod);

module.exports = router;
