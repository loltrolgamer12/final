const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Dashboard KPIs y tendencias
router.get('/', async (req, res) => {
	try {
		const totalInspecciones = await prisma.inspeccion.count();
		const totalAlertas = await prisma.inspeccion.count({ where: { tiene_alertas_criticas: true } });
		const bajoRiesgo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'BAJO' } });
		const medioRiesgo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'MEDIO' } });
		const altoRiesgo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'ALTO' } });

		// Tendencia de inspecciones por día (últimos 7 días)
		const desde = new Date();
		desde.setDate(desde.getDate() - 7);
		const tendencia = await prisma.inspeccion.groupBy({
			by: ['fecha'],
			where: { fecha: { gte: desde } },
			_count: { id: true }
		});

		// Conductores con más alertas
		const topConductores = await prisma.inspeccion.groupBy({
			by: ['conductor_nombre'],
			where: { tiene_alertas_criticas: true },
			_count: { id: true },
			orderBy: { _count: { id: 'desc' } },
			take: 5
		});

		return responseUtils.successResponse(res, {
			totalInspecciones,
			totalAlertas,
			bajoRiesgo,
			medioRiesgo,
			altoRiesgo,
			tendencia,
			topConductores
		});
	} catch (error) {
		return responseUtils.errorResponse(res, 'DASHBOARD_ERROR', error.message);
	}
});

module.exports = router;
