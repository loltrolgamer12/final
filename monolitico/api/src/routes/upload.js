const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const excelService = require('../services/excelService');
const responseUtils = require('../utils/responseUtils');

// Ruta para cargar y procesar archivo Excel
router.post('/', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return responseUtils.errorResponse(res, 'NO_FILE', 'No se envió ningún archivo');
		}
		const { buffer, originalname } = req.file;
		const result = await excelService.processExcelFile(buffer, originalname);
		if (result.success) {
			return responseUtils.successResponse(res, {
				mensaje: 'Archivo procesado correctamente',
				totalRegistros: result.totalRecords,
				registrosInsertados: result.insertados,
				registrosDuplicados: result.duplicates,
				registrosError: result.errors,
				fileHash: result.fileHash
			});
		} else {
			return responseUtils.errorResponse(res, 'UPLOAD_ERROR', result.error);
		}
	} catch (error) {
		return responseUtils.errorResponse(res, 'UPLOAD_ERROR', error.message);
	}
});

module.exports = router;
