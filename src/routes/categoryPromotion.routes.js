const express = require('express');
const router = express.Router();
const categoryPromotionController = require('../controllers/categoryPromotion.controller');

// Public
router.get('/category/:categoryId', categoryPromotionController.getByCategory);
router.get('/promotion/:promotionId', categoryPromotionController.getByPromotion);

module.exports = router;
