const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Public
router.get('/', categoryController.getAll);
// router.get('/tree', categoryController.getTree);
router.get('/promotions/:id', categoryController.getPromotionsByCategory);
router.get('/:id', categoryController.getById);
router.get('/:id/products', categoryController.getProductsByCategory);

module.exports = router;
