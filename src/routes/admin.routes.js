const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { verifyAdmin, verifyStrictAdmin } = require('../middleware/adminAuth');
const { upload } = require('../config/cloudinary');

// Import controllers
const categoryController = require('../controllers/category.controller');
const colorController = require('../controllers/color.controller');
const dimensionsController = require('../controllers/dimensions.controller');
const productController = require('../controllers/product.controller');
const productAttributeController = require('../controllers/productAttribute.controller');
const productImageController = require('../controllers/productImage.controller');
const promotionController = require('../controllers/promotion.controller');
const categoryPromotionController = require('../controllers/categoryPromotion.controller');
const paymentController = require('../controllers/payment.controller');
const staffController = require('../controllers/staff.controller');

// All admin routes require auth + admin/staff role
router.use(verifyToken);
router.use(verifyAdmin);

// Category Admin
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);
router.post('/categories/reorder', categoryController.reorder);

// Color Admin
router.post('/colors', colorController.create);
router.put('/colors/:id', colorController.update);
router.delete('/colors/:id', colorController.remove);

// Dimensions Admin
router.post('/dimensions', dimensionsController.create);
router.put('/dimensions/:id', dimensionsController.update);
router.delete('/dimensions/:id', dimensionsController.remove);

// Product Admin
router.post('/products', productController.create);
router.put('/products/:id', productController.update);
router.delete('/products/:id', productController.remove);

// Product Attribute Admin
router.post('/product-attributes', productAttributeController.create);
router.put('/product-attributes/:id', productAttributeController.update);
router.put('/product-attributes/:id/stock', productAttributeController.updateStock);
router.delete('/product-attributes/:id', productAttributeController.remove);

// Product Image Admin (with file upload)
router.post('/product-images', upload.single('image'), productImageController.create);
router.put('/product-images/:id/main', productImageController.setMain);
router.delete('/product-images/:id', productImageController.remove);
router.put('/product-images/reorder', productImageController.reorder);

// Promotion Admin
router.post('/promotions', promotionController.create);
router.put('/promotions/:id', promotionController.update);
router.delete('/promotions/:id', promotionController.remove);
router.put('/promotions/:id/activate', promotionController.activate);
router.put('/promotions/:id/deactivate', promotionController.deactivate);
router.get('/promotions/all', promotionController.getAll);

// Category Promotion Admin
router.post('/category-promotions', categoryPromotionController.create);
router.delete('/category-promotions/:id', categoryPromotionController.remove);
router.get('/category-promotions', categoryPromotionController.getAll);

// Order Admin - Đã chuyển sang order.routes.js với phân quyền đúng:
// GET  /api/orders              → getAll          (All Roles: verifyToken)
// GET  /api/orders/customer/:id → getByCustomerId (All Roles: verifyToken)
// GET  /api/orders/:id          → getById         (All Roles: verifyToken)
// PUT  /api/orders/:id/status   → updateStatus    (Staff/Admin: verifyToken + verifyStaff)
// PUT  /api/orders/:id/cancel   → cancel          (Authenticated: verifyToken)
// POST /api/orders              → create          (Customer: verifyToken + verifyCustomer)

// Order Detail Admin - Đã chuyển sang orderDetail.routes.js:
// GET /api/order-details/order/:orderId → getByOrder (All Roles: verifyToken)
// GET /api/order-details/:id            → getById    (All Roles: verifyToken)

// Payment Admin (Staff/Admin only)
// GET  /admin/payments              - Lấy tất cả payment
router.get('/payments', paymentController.adminGetAll);
// PUT  /admin/payments/:id/status?status=success - Cập nhật trạng thái COD (Admin cập nhật thủ công)
// VNPay tự động cập nhật status qua callback, COD admin tự cập nhật
router.put('/payments/:id/status', paymentController.adminUpdateStatus);

// Staff Admin (strict admin only for some)
router.get('/staff', staffController.adminGetAll);
router.post('/staff', staffController.adminCreate);
router.get('/staff/:id', staffController.adminGetById);
router.put('/staff/:id', staffController.adminUpdate);
router.delete('/staff/:id', staffController.adminDelete);
router.put('/staff/:id/activate', staffController.adminActivate);
router.put('/staff/:id/deactivate', staffController.adminDeactivate);

module.exports = router;
