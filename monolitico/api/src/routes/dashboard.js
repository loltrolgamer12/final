
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Dashboard ejecutivo de conductores
router.get('/conductores', async (req, res) => {
	try {
		   // Agrupar inspecciones por conductor
		   const conductores = await prisma.inspeccion.groupBy({
			   by: ['conductor_nombre', 'placa_vehiculo'],
			   _count: { id: true },
			   _max: { nivel_riesgo: true, fecha: true },
		   });

		   // Obtener motivo de fatiga de la última inspección si aplica
		   const data = await Promise.all(conductores.map(async c => {
			   let motivoFatiga = '';
			   if (c._max.nivel_riesgo === 'ALTO') {
				   // Buscar la última inspección de ese conductor y placa
				   const ultima = await prisma.inspeccion.findFirst({
					   where: {
						   conductor_nombre: c.conductor_nombre,
						   placa_vehiculo: c.placa_vehiculo,
						   nivel_riesgo: 'ALTO',
						   fecha: c._max.fecha
					   },
					   orderBy: { fecha: 'desc' }
				   });
				   if (ultima) {
					   let motivos = [];
					   if (ultima.consumo_medicamentos) motivos.push('Consumo de medicamentos');
					   if (ultima.horas_sueno_suficientes === false) motivos.push('Falta de sueño');
					   if (ultima.libre_sintomas_fatiga === false) motivos.push('Síntomas de fatiga');
					   if (ultima.condiciones_aptas === false) motivos.push('No apto para conducir');
					   if (ultima.puntaje_fatiga < 2) motivos.push('Puntaje de fatiga bajo');
					   if (motivos.length === 0) motivos.push('Riesgo alto detectado');
					   motivoFatiga = motivos.join(', ');
				   }
			   }
			   return {
				   nombre: c.conductor_nombre,
				   placa: c.placa_vehiculo,
				   alertas: c._count.id,
				   fatiga: c._max.nivel_riesgo === 'ALTO',
				   cumplimiento: c._max.nivel_riesgo !== 'ALTO',
				   motivoFatiga
			   };
		   }));
		   return responseUtils.successResponse(res, data);
	} catch (error) {
		return responseUtils.errorResponse(res, 'CONDUCTORES_DASHBOARD_ERROR', error.message);
	}
});

// Utilidad para motivo crítico de vehículo (detallado)

const { getMotivoCriticoDetallado } = require('../utils/responseUtils');

// Dashboard ejecutivo de vehículos
router.get('/vehiculos', async (req, res) => {
	try {
		const vehiculos = await prisma.inspeccion.groupBy({
			by: ['placa_vehiculo', 'conductor_nombre'],
			_count: { id: true },
			_max: { nivel_riesgo: true, fecha: true },
		});
		const data = await Promise.all(vehiculos.map(async v => {
			let motivoCritico = '';
			if (v._max.nivel_riesgo === 'ALTO') {
				const ultima = await prisma.inspeccion.findFirst({
					where: {
						placa_vehiculo: v.placa_vehiculo,
						conductor_nombre: v.conductor_nombre,
						nivel_riesgo: 'ALTO',
						fecha: v._max.fecha
					},
					orderBy: { fecha: 'desc' }
				});
				motivoCritico = ultima ? getMotivoCriticoDetallado(ultima) : '';
			}
			return {
				placa: v.placa_vehiculo,
				conductor: v.conductor_nombre,
				alertas: v._count.id,
				critico: v._max.nivel_riesgo === 'ALTO',
				cumplimiento: v._max.nivel_riesgo !== 'ALTO',
				motivoCritico
			};
		}));
		return responseUtils.successResponse(res, data);
	} catch (error) {
		return responseUtils.errorResponse(res, 'VEHICULOS_DASHBOARD_ERROR', error.message);
	}
});
// (eliminado duplicado)

// Dashboard KPIs y tendencias
router.get('/', async (req, res) => {
	try {
	// Total de inspecciones
	const totalInspecciones = await prisma.inspeccion.count();
	// Total de alertas críticas
	const totalAlertas = await prisma.inspeccion.count({ where: { tiene_alertas_criticas: true } });
	// Inspecciones en condiciones normales: sin alertas críticas y nivel_riesgo BAJO
	const bajoRiesgo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'BAJO', tiene_alertas_criticas: false } });
	// Inspecciones con riesgo medio (pueden o no tener alerta crítica)
	const medioRiesgo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'MEDIO' } });
	// Inspecciones con riesgo alto (pueden o no tener alerta crítica)
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
