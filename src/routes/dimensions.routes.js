const express = require('express');
const router = express.Router();
const dimensionsController = require('../controllers/dimensions.controller');

// Public
router.get('/', dimensionsController.getAll);
router.get('/:id', dimensionsController.getById);

module.exports = router;
