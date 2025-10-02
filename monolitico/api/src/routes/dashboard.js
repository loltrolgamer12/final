
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Dashboard ejecutivo de conductores
router.get('/conductores', async (req, res) => {
	try {
		// Filtros avanzados por query
		const { dia, mes, ano, conductor, placa, cumplimiento, fatiga } = req.query;
		let fechaFiltro = {};
		if (ano && mes && dia) {
			// Día exacto
			const mesStr = mes.toString().padStart(2, '0');
			const diaStr = dia.toString().padStart(2, '0');
			const desde = new Date(`${ano}-${mesStr}-${diaStr}`);
			const hasta = new Date(desde);
			hasta.setDate(hasta.getDate() + 1);
			fechaFiltro = { gte: desde, lt: hasta };
		} else if (ano && mes) {
			// Mes completo
			const mesStr = mes.toString().padStart(2, '0');
			const desde = new Date(`${ano}-${mesStr}-01`);
			const hasta = new Date(desde);
			hasta.setMonth(hasta.getMonth() + 1);
			fechaFiltro = { gte: desde, lt: hasta };
		} else if (ano) {
			// Año completo
			const desde = new Date(`${ano}-01-01`);
			const hasta = new Date(`${ano}-12-31`);
			hasta.setDate(hasta.getDate() + 1);
			fechaFiltro = { gte: desde, lt: hasta };
		}

		// Construir filtro para findMany
		let where = {};
		if (Object.keys(fechaFiltro).length) where.fecha = fechaFiltro;
		if (conductor) where.conductor_nombre = { contains: conductor, mode: 'insensitive' };
		if (placa) where.placa_vehiculo = { contains: placa, mode: 'insensitive' };
		if (cumplimiento === 'true') where.nivel_riesgo = { not: 'ALTO' };
		if (cumplimiento === 'false') where.nivel_riesgo = 'ALTO';
		if (fatiga === 'true') where.nivel_riesgo = 'ALTO';
		if (fatiga === 'false') where.nivel_riesgo = { not: 'ALTO' };

		// Buscar inspecciones filtradas
		const inspecciones = await prisma.inspeccion.findMany({ where });
		// Agrupar por conductor y placa
		const agrupadas = {};
		for (const i of inspecciones) {
			const key = `${i.conductor_nombre}||${i.placa_vehiculo}`;
			if (!agrupadas[key]) {
				agrupadas[key] = {
					nombre: i.conductor_nombre,
					placa: i.placa_vehiculo,
					alertas: 0,
					fatiga: false,
					cumplimiento: true,
					motivoFatiga: ''
				};
			}
			agrupadas[key].alertas++;
			if (i.nivel_riesgo === 'ALTO') {
				agrupadas[key].fatiga = true;
				agrupadas[key].cumplimiento = false;
				// Motivo fatiga solo de la última inspección ALTO
				if (!agrupadas[key].motivoFatiga || new Date(i.fecha) > new Date(agrupadas[key].fechaFatiga || 0)) {
					let motivos = [];
					if (i.consumo_medicamentos) motivos.push('Consumo de medicamentos');
					if (i.horas_sueno_suficientes === false) motivos.push('Falta de sueño');
					if (i.libre_sintomas_fatiga === false) motivos.push('Síntomas de fatiga');
					if (i.condiciones_aptas === false) motivos.push('No apto para conducir');
					if (i.puntaje_fatiga < 2) motivos.push('Puntaje de fatiga bajo');
					if (motivos.length === 0) motivos.push('Riesgo alto detectado');
					agrupadas[key].motivoFatiga = motivos.join(', ');
					agrupadas[key].fechaFatiga = i.fecha;
				}
			}
		}
		const data = Object.values(agrupadas).map(c => {
			delete c.fechaFatiga;
			return c;
		});
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
			// Filtros avanzados por query
			const { dia, mes, ano, conductor, placa, cumplimiento, critico } = req.query;
			let fechaFiltro = {};
			if (ano && mes && dia) {
				// Día exacto
				const mesStr = mes.toString().padStart(2, '0');
				const diaStr = dia.toString().padStart(2, '0');
				const desde = new Date(`${ano}-${mesStr}-${diaStr}`);
				const hasta = new Date(desde);
				hasta.setDate(hasta.getDate() + 1);
				fechaFiltro = { gte: desde, lt: hasta };
			} else if (ano && mes) {
				// Mes completo
				const mesStr = mes.toString().padStart(2, '0');
				const desde = new Date(`${ano}-${mesStr}-01`);
				const hasta = new Date(desde);
				hasta.setMonth(hasta.getMonth() + 1);
				fechaFiltro = { gte: desde, lt: hasta };
			} else if (ano) {
				// Año completo
				const desde = new Date(`${ano}-01-01`);
				const hasta = new Date(`${ano}-12-31`);
				hasta.setDate(hasta.getDate() + 1);
				fechaFiltro = { gte: desde, lt: hasta };
			}

			// Construir filtro para findMany
			let where = {};
			if (Object.keys(fechaFiltro).length) where.fecha = fechaFiltro;
			if (conductor) where.conductor_nombre = { contains: conductor, mode: 'insensitive' };
			if (placa) where.placa_vehiculo = { contains: placa, mode: 'insensitive' };
			if (cumplimiento === 'true') where.nivel_riesgo = { not: 'ALTO' };
			if (cumplimiento === 'false') where.nivel_riesgo = 'ALTO';
			if (critico === 'true') where.nivel_riesgo = 'ALTO';
			if (critico === 'false') where.nivel_riesgo = { not: 'ALTO' };

			// Buscar inspecciones filtradas
			const inspecciones = await prisma.inspeccion.findMany({ where });
			// Agrupar por placa y conductor
			const agrupadas = {};
			for (const i of inspecciones) {
				const key = `${i.placa_vehiculo}||${i.conductor_nombre}`;
				if (!agrupadas[key]) {
					agrupadas[key] = {
						placa: i.placa_vehiculo,
						conductor: i.conductor_nombre,
						alertas: 0,
						critico: false,
						cumplimiento: true,
						motivoCritico: ''
					};
				}
				agrupadas[key].alertas++;
				if (i.nivel_riesgo === 'ALTO') {
					agrupadas[key].critico = true;
					agrupadas[key].cumplimiento = false;
					// Motivo crítico solo de la última inspección ALTO
					if (!agrupadas[key].motivoCritico || new Date(i.fecha) > new Date(agrupadas[key].fechaCritico || 0)) {
						agrupadas[key].motivoCritico = getMotivoCriticoDetallado(i);
						agrupadas[key].fechaCritico = i.fecha;
					}
				}
			}
					const data = Object.values(agrupadas).map(v => {
						delete v.fechaCritico;
						return v;
					});
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

		// Datos rechazados y motivos de rechazo
		const totalRechazadosLigero = await prisma.rechazoInspeccion.count();
		const totalRechazadosPesado = await prisma.rechazoInspeccionPesado.count();
		const totalRechazados = totalRechazadosLigero + totalRechazadosPesado;

		// Motivos de rechazo agrupados (top 5)
		const motivosLigero = await prisma.rechazoInspeccion.groupBy({
			by: ['motivo_rechazo'],
			_count: { motivo_rechazo: true },
			orderBy: { _count: { motivo_rechazo: 'desc' } },
			take: 5
		});
		const motivosPesado = await prisma.rechazoInspeccionPesado.groupBy({
			by: ['motivo_rechazo'],
			_count: { motivo_rechazo: true },
			orderBy: { _count: { motivo_rechazo: 'desc' } },
			take: 5
		});
		// Unir y agrupar motivos
		const motivosMap = {};
		[...motivosLigero, ...motivosPesado].forEach(m => {
			const motivo = m.motivo_rechazo || 'Sin motivo';
			motivosMap[motivo] = (motivosMap[motivo] || 0) + m._count.motivo_rechazo;
		});
		// Convertir a array y ordenar
		const motivosRechazo = Object.entries(motivosMap)
			.map(([motivo, count]) => ({ motivo, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

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
		topConductores,
		totalRechazados,
		motivosRechazo
		});
	} catch (error) {
		console.error('DASHBOARD_ERROR:', error);
		return responseUtils.errorResponse(res, 'DASHBOARD_ERROR', error.message);
	}
});

module.exports = router;
