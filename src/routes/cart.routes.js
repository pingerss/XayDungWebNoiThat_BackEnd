const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const verifyToken = require('../middleware/auth');

// All cart routes are protected
router.use(verifyToken);

// Cart
router.get('/', cartController.getCart);
router.get('/items/count', cartController.getItemCount);
router.get('/total', cartController.getTotal);
router.post('/add', cartController.addItem);
router.put('/update/:itemId', cartController.updateItem);
router.delete('/remove/:itemId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);
router.post('/apply-promotion', cartController.applyPromotion);
router.delete('/remove-promotion', cartController.removePromotion);
router.post('/sync', cartController.syncCart);
router.get('/checkout-info', cartController.getCheckoutInfo);

// Cart Items
router.get('/items', cartController.getAllItems);
router.get('/items/:itemId', cartController.getItemById);
router.put('/items/:itemId/quantity', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.deleteItem);

module.exports = router;
