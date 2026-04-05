const express = require('express');
const router = express.Router();
const productAttributeController = require('../controllers/productAttribute.controller');

// Public
router.get('/product/:productId', productAttributeController.getByProduct);
router.get('/:id/stock', productAttributeController.checkStock);
router.get('/:id', productAttributeController.getById);

module.exports = router;
