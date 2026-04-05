const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// Public (put specific routes before /:id)
router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/trending', productController.getTrending);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/best-sellers', productController.getBestSellers);
router.get('/related/:id', productController.getRelated);
router.get('/category/:categoryId', productController.getByCategory);
router.get('/attributes/:attributeId', productController.getAttributeDetail);
router.get('/stock/:attributeId', productController.checkStock);
router.post('/:id/view', productController.incrementView);
router.get('/:id', productController.getById);

module.exports = router;
