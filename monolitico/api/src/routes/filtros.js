// Endpoint para obtener los valores únicos de contrato y campo_coordinacion
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// GET /filtros/vehiculos
router.get('/vehiculos', async (req, res) => {
  try {
    // Obtener valores únicos de contrato y campo_coordinacion
    const contratos = await prisma.inspeccion.findMany({
      select: { contrato: true },
      distinct: ['contrato']
    });
    const campos = await prisma.inspeccion.findMany({
      select: { campo_coordinacion: true },
      distinct: ['campo_coordinacion']
    });
    // Limpiar nulos y mapear a array simple
    const contratoOptions = contratos
      .map(c => c.contrato)
      .filter(c => !!c);
    const campoOptions = campos
      .map(c => c.campo_coordinacion)
      .filter(c => !!c);
    return responseUtils.successResponse(res, {
      contratos: contratoOptions,
      campos: campoOptions
    });
  } catch (error) {
    return responseUtils.errorResponse(res, 'FILTROS_VEHICULOS_ERROR', error.message);
  }
});

module.exports = router;
