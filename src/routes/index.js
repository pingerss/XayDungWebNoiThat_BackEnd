const express = require('express');
const router = express.Router();

// Auth Routes (unified login)
const authRoutes = require('./auth.routes');

// Public Routes
const customerRoutes = require('./customer.routes');
const categoryRoutes = require('./category.routes');
const colorRoutes = require('./color.routes');
const dimensionsRoutes = require('./dimensions.routes');
const productRoutes = require('./product.routes');
const productAttributeRoutes = require('./productAttribute.routes');
const productImageRoutes = require('./productImage.routes');
const cartRoutes = require('./cart.routes');
const promotionRoutes = require('./promotion.routes');
const categoryPromotionRoutes = require('./categoryPromotion.routes');
const orderRoutes = require('./order.routes');
const orderDetailRoutes = require('./orderDetail.routes');
const paymentRoutes = require('./payment.routes');
const staffRoutes = require('./staff.routes');

// Admin Routes
const adminRoutes = require('./admin.routes');

// Register auth routes
router.use('/auth', authRoutes);

// Register public/protected routes
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/colors', colorRoutes);
router.use('/dimensions', dimensionsRoutes);
router.use('/products', productRoutes);
router.use('/product-attributes', productAttributeRoutes);
router.use('/product-images', productImageRoutes);
router.use('/cart', cartRoutes);
router.use('/promotions', promotionRoutes);
router.use('/category-promotions', categoryPromotionRoutes);
router.use('/orders', orderRoutes);
router.use('/order-details', orderDetailRoutes);
router.use('/payments', paymentRoutes);
router.use('/staff', staffRoutes);

// Register admin routes
router.use('/admin', adminRoutes);

module.exports = router;
