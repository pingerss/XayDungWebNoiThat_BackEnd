const express = require('express');
const router = express.Router();
const productImageController = require('../controllers/productImage.controller');

// Public
router.get('/product/:productId', productImageController.getByProduct);
router.get('/:id', productImageController.getById);

module.exports = router;
