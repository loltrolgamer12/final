const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');

router.get('/', excelController.getReporteExcel);

module.exports = router;
