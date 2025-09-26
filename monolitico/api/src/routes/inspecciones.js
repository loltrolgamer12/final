const express = require('express');
const router = express.Router();
const inspeccionesController = require('../controllers/inspeccionesController');

router.get('/', inspeccionesController.getInspecciones);

module.exports = router;
