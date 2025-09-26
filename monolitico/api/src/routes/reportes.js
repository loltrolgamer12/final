const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/', reportesController.getReporte);
// Aquí se puede agregar la ruta para PDF en el futuro

module.exports = router;
