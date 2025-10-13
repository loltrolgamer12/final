// Endpoint para obtener los valores únicos de contrato y campo_coordinacion
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// GET /filtros/vehiculos
router.get('/vehiculos', async (req, res) => {
  try {
    // Obtener valores únicos de contrato y campo_coordinacion de AMBAS tablas
    const contratosLigero = await prisma.inspeccion.findMany({
      select: { contrato: true },
      distinct: ['contrato']
    });
    const contratosPesado = await prisma.inspeccionPesado.findMany({
      select: { contrato: true },
      distinct: ['contrato']
    });
    
    const camposLigero = await prisma.inspeccion.findMany({
      select: { campo_coordinacion: true },
      distinct: ['campo_coordinacion']
    });
    const camposPesado = await prisma.inspeccionPesado.findMany({
      select: { campo_coordinacion: true },
      distinct: ['campo_coordinacion']
    });
    
    // Combinar y eliminar duplicados
    const contratosSet = new Set([
      ...contratosLigero.map(c => c.contrato),
      ...contratosPesado.map(c => c.contrato)
    ]);
    const camposSet = new Set([
      ...camposLigero.map(c => c.campo_coordinacion),
      ...camposPesado.map(c => c.campo_coordinacion)
    ]);
    
    // Limpiar nulos y convertir a array
    const contratoOptions = Array.from(contratosSet).filter(c => !!c);
    const campoOptions = Array.from(camposSet).filter(c => !!c);
    
    return responseUtils.successResponse(res, {
      contratos: contratoOptions,
      campos: campoOptions
    });
  } catch (error) {
    return responseUtils.errorResponse(res, 'FILTROS_VEHICULOS_ERROR', error.message);
  }
});

module.exports = router;
