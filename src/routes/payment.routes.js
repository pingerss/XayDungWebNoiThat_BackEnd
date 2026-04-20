const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth');
const { verifyCustomer } = require('../middleware/roleAuth');

// ============================================================
// CUSTOMER ONLY - Đặt trước wildcard routes để tránh conflict
// ============================================================
// ẢNH 2: Tạo link VNPay (phải tạo payment ảnh 1 trước)
// POST /api/payments/vnpay/create?orderId=...
router.post('/vnpay/create', verifyToken, verifyCustomer, paymentController.createVnpay);

// ============================================================
// ALL ROLES - Tất cả người dùng đã đăng nhập
// ============================================================
// ẢNH 1: Tạo thanh toán (VNPay hoặc COD)
// POST /api/payments  -  body: { orderId, method, amount }
router.post('/', verifyToken, paymentController.createPayment);

// ẢNH 5: Lấy payment theo orderId (đặt trước /:id để tránh conflict)
// GET /api/payments/order/:orderId
router.get('/order/:orderId', verifyToken, paymentController.getByOrder);

// ẢNH 4: Lấy payment theo ID
// GET /api/payments/:id
router.get('/:id', verifyToken, paymentController.getById);

module.exports = router;
