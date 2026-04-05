const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

// Public
router.get('/', promotionController.getActive);
router.get('/validate/:code', promotionController.validate);
router.get('/code/:code', promotionController.getByCode);
router.get('/for-product/:productId', promotionController.getForProduct);
router.get('/:id', promotionController.getById);

module.exports = router;
