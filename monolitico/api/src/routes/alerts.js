const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Alertas críticas recientes
router.get('/', async (req, res) => {
	try {
		const { tipo, fechaInicio, fechaFin } = req.query;
		const where = { tiene_alertas_criticas: true };
		if (fechaInicio && fechaFin) {
			where.fecha = { gte: new Date(fechaInicio), lte: new Date(fechaFin) };
		}
		// Si hay tipo de alerta, se puede filtrar por campo adicional si existe en el modelo
		// Ejemplo: where.tipo_alerta = tipo;
		const alertasRaw = await prisma.inspeccion.findMany({
			where,
			orderBy: { fecha: 'desc' },
			take: 20
		});
		// Mapear a formato esperado por el frontend
		const alertas = alertasRaw.map(a => ({
			tipo: a.nivel_riesgo ? (a.nivel_riesgo === 'ALTO' ? 'FATIGA' : 'VEHICULO_CRITICO') : 'SIN_TIPO',
			mensaje: a.observaciones || 'Sin observaciones',
			conductor: a.conductor_nombre,
			placa: a.placa_vehiculo,
			fecha: a.fecha,
			motivos: {
				consumo_medicamentos: a.consumo_medicamentos,
				horas_sueno_suficientes: a.horas_sueno_suficientes,
				libre_sintomas_fatiga: a.libre_sintomas_fatiga,
				condiciones_aptas: a.condiciones_aptas
			}
		}));
		return responseUtils.successResponse(res, alertas);
	} catch (error) {
		return responseUtils.errorResponse(res, 'ALERTS_ERROR', error.message);
	}
});

module.exports = router;
