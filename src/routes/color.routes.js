const express = require('express');
const router = express.Router();
const colorController = require('../controllers/color.controller');

// Public
router.get('/', colorController.getAll);
router.get('/active', colorController.getActive);
router.get('/:id', colorController.getById);

module.exports = router;
