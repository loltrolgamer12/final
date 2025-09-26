const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Búsqueda instantánea (por query)
router.get('/', async (req, res) => {
	try {
		const { query } = req.query;
		if (!query || query.length < 2) {
			return responseUtils.successResponse(res, []);
		}
		const results = await prisma.inspeccion.findMany({
			where: {
				OR: [
					{ conductor_nombre: { contains: query, mode: 'insensitive' } },
					{ placa_vehiculo: { contains: query, mode: 'insensitive' } },
					{ contrato: { contains: query, mode: 'insensitive' } },
					{ campo_coordinacion: { contains: query, mode: 'insensitive' } }
				]
			},
			select: {
				id: true,
				conductor_nombre: true,
				placa_vehiculo: true,
				fecha: true,
				contrato: true,
				nivel_riesgo: true
			},
			take: 20,
			orderBy: { fecha: 'desc' }
		});
		return responseUtils.successResponse(res, results);
	} catch (error) {
		return responseUtils.errorResponse(res, 'SEARCH_ERROR', error.message);
	}
});

// Búsqueda avanzada (por filtros)
router.get('/advanced', async (req, res) => {
	try {
		const { fechaInicio, fechaFin, turno, nivel_riesgo, conductor, placa, contrato, page = 1, pageSize = 20 } = req.query;
		const where = {};
		if (fechaInicio && fechaFin) {
			where.fecha = { gte: new Date(fechaInicio), lte: new Date(fechaFin) };
		}
		if (turno) where.turno = turno;
		if (nivel_riesgo) where.nivel_riesgo = nivel_riesgo;
		if (conductor) where.conductor_nombre = { contains: conductor, mode: 'insensitive' };
		if (placa) where.placa_vehiculo = { contains: placa, mode: 'insensitive' };
		if (contrato) where.contrato = { contains: contrato, mode: 'insensitive' };

		const skip = (parseInt(page) - 1) * parseInt(pageSize);
		const total = await prisma.inspeccion.count({ where });
		const results = await prisma.inspeccion.findMany({
			where,
			take: parseInt(pageSize),
			skip,
			orderBy: { fecha: 'desc' }
		});
		return responseUtils.successResponse(res, {
			total,
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			results
		});
	} catch (error) {
		return responseUtils.errorResponse(res, 'SEARCH_ADV_ERROR', error.message);
	}
});

module.exports = router;
