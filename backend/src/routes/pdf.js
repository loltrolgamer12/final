const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

router.get('/', pdfController.getReportePDF);

module.exports = router;
