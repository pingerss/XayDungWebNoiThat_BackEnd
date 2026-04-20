const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const verifyToken = require('../middleware/auth');
const { verifyCustomer, verifyStaff } = require('../middleware/roleAuth');

// ============================================================
// ALL ROLES (chỉ cần đăng nhập)
// ============================================================
// GET /api/orders - Lấy tất cả đơn hàng
router.get('/', verifyToken, orderController.getAll);

// GET /api/orders/customer/:customerId - Lấy đơn theo customerId
// PHẢI đặt trước /:id để tránh conflict với route động
router.get('/customer/:customerId', verifyToken, orderController.getByCustomerId);

// GET /api/orders/:id - Lấy đơn theo id
router.get('/:id', verifyToken, orderController.getById);

// PUT /api/orders/:id/cancel - Hủy đơn hàng
router.put('/:id/cancel', verifyToken, orderController.cancel);

// ============================================================
// CUSTOMER ONLY
// ============================================================
// POST /api/orders - Tạo đơn hàng
router.post('/', verifyToken, verifyCustomer, orderController.create);

// ============================================================
// STAFF / ADMIN ONLY
// ============================================================
// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
// body: { status: "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED", note }
router.put('/:id/status', verifyToken, verifyStaff, orderController.updateStatus);

module.exports = router;
