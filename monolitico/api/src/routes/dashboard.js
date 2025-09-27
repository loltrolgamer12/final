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
		const inspecciones = await prisma.inspeccion.findMany({
			where: { fecha: { gte: desde } },
			select: { fecha: true }
		});
		// Agrupar por día (YYYY-MM-DD)
		const tendenciaMap = {};
		inspecciones.forEach(i => {
			const dia = i.fecha.toISOString().slice(0, 10);
			tendenciaMap[dia] = (tendenciaMap[dia] || 0) + 1;
		});
		const tendencia = Object.keys(tendenciaMap).sort().map(fecha => ({ fecha, count: tendenciaMap[fecha] }));

		// Conductores con más alertas
		const alertas = await prisma.inspeccion.findMany({
			where: { tiene_alertas_criticas: true },
			select: { conductor_nombre: true }
		});
		const conductorMap = {};
		alertas.forEach(a => {
			if (a.conductor_nombre) {
				conductorMap[a.conductor_nombre] = (conductorMap[a.conductor_nombre] || 0) + 1;
			}
		});
		const topConductores = Object.entries(conductorMap)
			.map(([conductor_nombre, count]) => ({ conductor_nombre, _count: { id: count } }))
			.sort((a, b) => b._count.id - a._count.id)
			.slice(0, 5);

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
		console.error('DASHBOARD_ERROR:', error);
		return responseUtils.errorResponse(res, 'DASHBOARD_ERROR', error.message);
	}
});

module.exports = router;
