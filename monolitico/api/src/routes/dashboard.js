
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Dashboard ejecutivo de conductores
router.get('/conductores', async (req, res) => {
	try {
		// Filtros avanzados por query
		const { dia, mes, ano, conductor, placa, cumplimiento, fatiga, tipo, contrato, campo } = req.query;
		const incluirLigero = !tipo || tipo === 'ligero' || tipo === 'todos';
		const incluirPesado = !tipo || tipo === 'pesado' || tipo === 'todos';

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

		// Construir filtro básico (sin fatiga/cumplimiento porque se aplican después)
		let where = {};
		if (Object.keys(fechaFiltro).length) where.fecha = fechaFiltro;
		if (conductor) where.conductor_nombre = { contains: conductor, mode: 'insensitive' };
		if (placa) where.placa_vehiculo = { contains: placa, mode: 'insensitive' };
		if (contrato) where.contrato = { contains: contrato, mode: 'insensitive' };
		if (campo) where.campo_coordinacion = { contains: campo, mode: 'insensitive' };

		// Buscar inspecciones filtradas de ambas tablas
		let inspecciones = [];
		
		if (incluirLigero) {
			const inspeccionesLigero = await prisma.inspeccion.findMany({ where });
			inspecciones = [...inspecciones, ...inspeccionesLigero];
		}
		
		if (incluirPesado) {
			// Para pesados, usar marca_temporal en lugar de fecha
			const wherePesado = { ...where };
			if (wherePesado.fecha) {
				wherePesado.marca_temporal = wherePesado.fecha;
				delete wherePesado.fecha;
			}
			// Si filtra por conductor_nombre, cambiar a nombre_inspector
			if (wherePesado.conductor_nombre) {
				wherePesado.nombre_inspector = wherePesado.conductor_nombre;
				delete wherePesado.conductor_nombre;
			}
			const inspeccionesPesado = await prisma.inspeccionPesado.findMany({ where: wherePesado });
			// Normalizar campos para pesados (fecha y conductor_nombre)
			const inspeccionesPesadoNormalizadas = inspeccionesPesado.map(i => ({
				...i,
				fecha: i.marca_temporal,
				conductor_nombre: i.nombre_inspector
			}));
			inspecciones = [...inspecciones, ...inspeccionesPesadoNormalizadas];
		}
		
		// Agrupar por conductor (ignorar conductores sin nombre)
		const agrupadas = {};
		for (const i of inspecciones) {
			const key = i.conductor_nombre;
			// Ignorar inspecciones sin conductor
			if (!key || key.trim() === '') continue;
			
			if (!agrupadas[key]) {
				agrupadas[key] = {
					nombre: i.conductor_nombre,
					placa: i.placa_vehiculo || '',
					alertas: 0,
					fatiga: false,
					cumplimiento: true,
					motivoFatiga: '',
					fechaFatiga: null,
					ultimaFecha: i.fecha,
					placas: [] // Array para rastrear todas las placas
				};
			}
			
			// Actualizar fecha con la inspección más reciente
			if (new Date(i.fecha) > new Date(agrupadas[key].ultimaFecha)) {
				agrupadas[key].ultimaFecha = i.fecha;
			}
			
			// Recolectar todas las placas válidas (sin duplicados)
			if (i.placa_vehiculo && i.placa_vehiculo.trim() !== '' && 
			    !agrupadas[key].placas.includes(i.placa_vehiculo)) {
				agrupadas[key].placas.push(i.placa_vehiculo);
			}
			
			// SOLO contar si hay problemas del CONDUCTOR
			const tieneProblemaConductor = 
				i.consumo_medicamentos === true ||
				i.horas_sueno_suficientes === false ||
				i.libre_sintomas_fatiga === false;
			
			if (tieneProblemaConductor) {
				agrupadas[key].alertas++;
				agrupadas[key].fatiga = true;
				agrupadas[key].cumplimiento = false;
				
				// Guardar motivo de la inspección más reciente CON PROBLEMAS
				if (!agrupadas[key].fechaFatiga || new Date(i.fecha) > new Date(agrupadas[key].fechaFatiga)) {
					let motivos = [];
					if (i.consumo_medicamentos === true) motivos.push('Consumo de medicamentos');
					if (i.horas_sueno_suficientes === false) motivos.push('Falta de sueño');
					if (i.libre_sintomas_fatiga === false) motivos.push('Síntomas de fatiga');
					agrupadas[key].motivoFatiga = motivos.join(', ');
					agrupadas[key].fechaFatiga = i.fecha;
				}
			}
		}
		
		// Convertir a array (sin filtrar por alertas por defecto)
		let data = Object.values(agrupadas);
		
		// Filtrar por fatiga (true = CON fatiga, false = SIN fatiga)
		if (fatiga === 'true') {
			data = data.filter(c => c.fatiga === true);
		} else if (fatiga === 'false') {
			data = data.filter(c => c.fatiga === false);
		}
		
		// Filtrar por cumplimiento (true = cumple, false = NO cumple)
		if (cumplimiento === 'true') {
			data = data.filter(c => c.cumplimiento === true);
		} else if (cumplimiento === 'false') {
			data = data.filter(c => c.cumplimiento === false);
		}
		
		// Limpiar campo temporal y usar ultimaFecha como fecha principal
		data = data.map(c => {
			const { fechaFatiga, ultimaFecha, placas, ...rest } = c;
			// Usar la última placa del array (la más reciente agregada) o todas si hay múltiples
			const placaFinal = placas.length > 0 ? placas[placas.length - 1] : '';
			return {
				...rest,
				placa: placaFinal,
				todasPlacas: placas.join(', '), // Campo adicional con todas las placas
				fecha: ultimaFecha ? new Date(ultimaFecha).toLocaleDateString('es-ES') : null,
				fechaProblema: fechaFatiga ? new Date(fechaFatiga).toLocaleDateString('es-ES') : null
			};
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
		const { dia, mes, ano, conductor, placa, cumplimiento, critico, tipo, contrato, campo } = req.query;
		const incluirLigero = !tipo || tipo === 'ligero' || tipo === 'todos';
		const incluirPesado = !tipo || tipo === 'pesado' || tipo === 'todos';

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

		// Construir filtro básico (sin critico/cumplimiento porque se aplican después)
		let where = {};
		if (Object.keys(fechaFiltro).length) where.fecha = fechaFiltro;
		if (conductor) where.conductor_nombre = { contains: conductor, mode: 'insensitive' };
		if (placa) where.placa_vehiculo = { contains: placa, mode: 'insensitive' };
		if (contrato) where.contrato = { contains: contrato, mode: 'insensitive' };
		if (campo) where.campo_coordinacion = { contains: campo, mode: 'insensitive' };

		// Buscar inspecciones filtradas de ambas tablas
		let inspecciones = [];
		
		if (incluirLigero) {
			const inspeccionesLigero = await prisma.inspeccion.findMany({ where });
			inspecciones = [...inspecciones, ...inspeccionesLigero];
		}
		
		if (incluirPesado) {
			// Para pesados, usar marca_temporal en lugar de fecha
			const wherePesado = { ...where };
			if (wherePesado.fecha) {
				wherePesado.marca_temporal = wherePesado.fecha;
				delete wherePesado.fecha;
			}
			// Si filtra por conductor_nombre, cambiar a nombre_inspector
			if (wherePesado.conductor_nombre) {
				wherePesado.nombre_inspector = wherePesado.conductor_nombre;
				delete wherePesado.conductor_nombre;
			}
			const inspeccionesPesado = await prisma.inspeccionPesado.findMany({ where: wherePesado });
			// Normalizar campos para pesados (fecha y conductor_nombre)
			const inspeccionesPesadoNormalizadas = inspeccionesPesado.map(i => ({
				...i,
				fecha: i.marca_temporal,
				conductor_nombre: i.nombre_inspector
			}));
			inspecciones = [...inspecciones, ...inspeccionesPesadoNormalizadas];
		}
		
		// Agrupar SOLO por placa (si no hay placa, usar conductor como identificador)
		const agrupadas = {};
		for (const i of inspecciones) {
			// Si no hay placa válida, usar conductor + ID como clave única
			const key = (i.placa_vehiculo && i.placa_vehiculo.trim() !== '') 
				? i.placa_vehiculo 
				: `SIN_PLACA_${i.conductor_nombre || 'DESCONOCIDO'}_${i.id || ''}`;
			
			if (!agrupadas[key]) {
				agrupadas[key] = {
					placa: i.placa_vehiculo || 'SIN PLACA',
					conductor: i.conductor_nombre,
					alertas: 0,
					alertasCriticas: 0,
					critico: false,
					cumplimiento: true,
					motivoCritico: '',
					fechaCritico: null
				};
			}
			
			// Verificar si hay CUALQUIER problema del vehículo (no solo críticos)
		const camposVehiculo = [
			// Luces
			'altas_bajas', 'direccionales', 'parqueo', 'freno', 'reversa',
			// Espejos y vidrios
			'espejos', 'vidrio_frontal', 'vidrios',
			// Condiciones generales
			'presentacion_aseo', 'pito', 'gps',
			// Frenos y cinturones
			'frenos', 'frenos_emergencia', 'cinturones',
			// Carrocería
			'puertas', 'limpiaparabrisas', 'extintor', 'botiquin', 'tapiceria', 'indicadores', 'objetos_sueltos',
			// Niveles de fluidos
			'nivel_aceite_motor', 'nivel_fluido_frenos', 'nivel_fluido_dir_hidraulica', 
			'nivel_fluido_refrigerante', 'nivel_fluido_limpia_parabrisas',
			// Motor y electricidad
			'correas', 'baterias',
			// Llantas
			'llantas_labrado', 'llantas_sin_cortes', 'llanta_repuesto', 'copas_pernos',
			// Suspensión y dirección
			'suspension', 'direccion',
			// Otros
			'tapa_tanque', 'equipo_carretera', 'kit_ambiental', 'documentacion'
		];
		const tieneProblemaVehiculo = camposVehiculo.some(c => i[c] === false);			// Determinar si es CRÍTICO (mismo criterio de riesgo)
			const esCritico = 
				i.frenos === false ||
				i.frenos_emergencia === false ||
				i.cinturones === false ||
				i.freno === false;
			
			if (tieneProblemaVehiculo) {
				agrupadas[key].alertas++;
				agrupadas[key].cumplimiento = false;
				
				// Contar alertas críticas por separado
				if (esCritico) {
					agrupadas[key].alertasCriticas++;
					agrupadas[key].critico = true;
				}
				
				// Guardar motivo y conductor de la inspección más reciente CON PROBLEMAS
				if (!agrupadas[key].fechaCritico || new Date(i.fecha) > new Date(agrupadas[key].fechaCritico)) {
					// Usar la misma función que el reporte Excel para consistencia
					agrupadas[key].motivoCritico = responseUtils.getMotivoCriticoDetallado(i);
					agrupadas[key].fechaCritico = i.fecha;
					agrupadas[key].conductor = i.conductor_nombre;
				}
			}
		}
		
		// Convertir a array - MOSTRAR TODOS los vehículos (con y sin problemas)
		let data = Object.values(agrupadas);
		
		// Filtrar por critico (true = CON problemas críticos, false = SIN problemas)
		if (critico === 'true') {
			data = data.filter(v => v.critico === true);
		} else if (critico === 'false') {
			data = data.filter(v => v.critico === false);
		}
		
		// Filtrar por cumplimiento (true = cumple, false = NO cumple)
		if (cumplimiento === 'true') {
			data = data.filter(v => v.cumplimiento === true);
		} else if (cumplimiento === 'false') {
			data = data.filter(v => v.cumplimiento === false);
		}
		
		// Renombrar fechaCritico a fecha para el frontend
		data = data.map(v => {
			const { fechaCritico, ...rest } = v;
			return {
				...rest,
				fecha: fechaCritico ? new Date(fechaCritico).toLocaleDateString('es-ES') : null
			};
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
		// Filtros avanzados por query - igual que vehículos y conductores
		const { tipo, dia, mes, ano, conductor, placa, cumplimiento, critico, fatiga, contrato, campo } = req.query;
		const incluirLigero = !tipo || tipo === 'ligero' || tipo === 'todos';
		const incluirPesado = !tipo || tipo === 'pesado' || tipo === 'todos';

		// Construir filtro de fecha
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

		// Construir filtros básicos para ligeros y pesados
		let whereLigero = {};
		let wherePesado = {};
		
		if (Object.keys(fechaFiltro).length) {
			whereLigero.fecha = fechaFiltro;
			wherePesado.marca_temporal = fechaFiltro;
		}
		if (conductor) {
			whereLigero.conductor_nombre = { contains: conductor, mode: 'insensitive' };
			wherePesado.nombre_inspector = { contains: conductor, mode: 'insensitive' };
		}
		if (placa) {
			whereLigero.placa_vehiculo = { contains: placa, mode: 'insensitive' };
			wherePesado.placa_vehiculo = { contains: placa, mode: 'insensitive' };
		}
		if (contrato) {
			whereLigero.contrato = { contains: contrato, mode: 'insensitive' };
			wherePesado.contrato = { contains: contrato, mode: 'insensitive' };
		}
		if (campo) {
			whereLigero.campo_coordinacion = { contains: campo, mode: 'insensitive' };
			wherePesado.campo_coordinacion = { contains: campo, mode: 'insensitive' };
		}

		// Filtros por cumplimiento
		if (cumplimiento === 'true') {
			whereLigero.tiene_alertas_criticas = false;
			wherePesado.tiene_alertas_criticas = false;
		} else if (cumplimiento === 'false') {
			whereLigero.tiene_alertas_criticas = true;
			wherePesado.tiene_alertas_criticas = true;
		}

		// Filtros por riesgo crítico
		if (critico === 'true') {
			whereLigero.nivel_riesgo = 'ALTO';
			wherePesado.nivel_riesgo = 'ALTO';
		} else if (critico === 'false') {
			whereLigero.nivel_riesgo = { in: ['BAJO', 'MEDIO'] };
			wherePesado.nivel_riesgo = { in: ['BAJO', 'MEDIO'] };
		}

		// Filtros por fatiga (solo para conductores)
		if (fatiga === 'true') {
			// Conductores CON problemas de fatiga
			whereLigero.OR = [
				{ consumo_medicamentos: true },
				{ horas_sueno_suficientes: false },
				{ libre_sintomas_fatiga: false }
			];
			wherePesado.OR = [
				{ consumo_medicamentos: true },
				{ horas_sueno_suficientes: false },
				{ libre_sintomas_fatiga: false }
			];
		} else if (fatiga === 'false') {
			// Conductores SIN problemas de fatiga
			whereLigero.AND = [
				{ consumo_medicamentos: false },
				{ horas_sueno_suficientes: true },
				{ libre_sintomas_fatiga: true }
			];
			wherePesado.AND = [
				{ consumo_medicamentos: false },
				{ horas_sueno_suficientes: true },
				{ libre_sintomas_fatiga: true }
			];
		}

		// Total de inspecciones (aplicando filtros)
		let totalInspecciones = 0;
		if (incluirLigero) totalInspecciones += await prisma.inspeccion.count({ where: whereLigero });
		if (incluirPesado) totalInspecciones += await prisma.inspeccionPesado.count({ where: wherePesado });

		// Total de alertas críticas (aplicando filtros)
		let totalAlertas = 0;
		if (incluirLigero) {
			const whereAlertasLigero = { ...whereLigero, tiene_alertas_criticas: true };
			totalAlertas += await prisma.inspeccion.count({ where: whereAlertasLigero });
		}
		if (incluirPesado) {
			const whereAlertasPesado = { ...wherePesado, tiene_alertas_criticas: true };
			totalAlertas += await prisma.inspeccionPesado.count({ where: whereAlertasPesado });
		}

		// Inspecciones en condiciones normales: sin alertas críticas y nivel_riesgo BAJO (aplicando filtros)
		let bajoRiesgo = 0;
		if (incluirLigero) {
			const whereBajoLigero = { ...whereLigero, nivel_riesgo: 'BAJO', tiene_alertas_criticas: false };
			bajoRiesgo += await prisma.inspeccion.count({ where: whereBajoLigero });
		}
		if (incluirPesado) {
			const whereBajoPesado = { ...wherePesado, nivel_riesgo: 'BAJO', tiene_alertas_criticas: false };
			bajoRiesgo += await prisma.inspeccionPesado.count({ where: whereBajoPesado });
		}

		// Inspecciones con riesgo medio (aplicando filtros)
		let medioRiesgo = 0;
		if (incluirLigero) {
			const whereMedioLigero = { ...whereLigero, nivel_riesgo: 'MEDIO' };
			medioRiesgo += await prisma.inspeccion.count({ where: whereMedioLigero });
		}
		if (incluirPesado) {
			const whereMedioPesado = { ...wherePesado, nivel_riesgo: 'MEDIO' };
			medioRiesgo += await prisma.inspeccionPesado.count({ where: whereMedioPesado });
		}

		// Inspecciones con riesgo alto (aplicando filtros)
		let altoRiesgo = 0;
		if (incluirLigero) {
			const whereAltoLigero = { ...whereLigero, nivel_riesgo: 'ALTO' };
			altoRiesgo += await prisma.inspeccion.count({ where: whereAltoLigero });
		}
		if (incluirPesado) {
			const whereAltoPesado = { ...wherePesado, nivel_riesgo: 'ALTO' };
			altoRiesgo += await prisma.inspeccionPesado.count({ where: whereAltoPesado });
		}

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

		// Tendencia de inspecciones por día (últimos 7 días aplicando filtros)
		const desde = new Date();
		desde.setDate(desde.getDate() - 7);
		
		const tendenciaMap = {};
		
		if (incluirLigero) {
			// Combinar filtro de fecha de tendencia con otros filtros
			const whereTendenciaLigero = { ...whereLigero };
			if (whereTendenciaLigero.fecha) {
				// Si ya hay filtro de fecha, usar el más restrictivo
				const fechaExistente = whereTendenciaLigero.fecha;
				whereTendenciaLigero.fecha = {
					gte: fechaExistente.gte && fechaExistente.gte > desde ? fechaExistente.gte : desde,
					...(fechaExistente.lt && { lt: fechaExistente.lt })
				};
			} else {
				whereTendenciaLigero.fecha = { gte: desde };
			}
			
			const inspeccionesLigero = await prisma.inspeccion.findMany({
				where: whereTendenciaLigero,
				select: { fecha: true }
			});
			inspeccionesLigero.forEach(i => {
				const dia = i.fecha.toISOString().slice(0, 10);
				tendenciaMap[dia] = (tendenciaMap[dia] || 0) + 1;
			});
		}
		
		if (incluirPesado) {
			// Combinar filtro de fecha de tendencia con otros filtros
			const whereTendenciaPesado = { ...wherePesado };
			if (whereTendenciaPesado.marca_temporal) {
				// Si ya hay filtro de fecha, usar el más restrictivo
				const fechaExistente = whereTendenciaPesado.marca_temporal;
				whereTendenciaPesado.marca_temporal = {
					gte: fechaExistente.gte && fechaExistente.gte > desde ? fechaExistente.gte : desde,
					...(fechaExistente.lt && { lt: fechaExistente.lt })
				};
			} else {
				whereTendenciaPesado.marca_temporal = { gte: desde };
			}
			
			const inspeccionesPesado = await prisma.inspeccionPesado.findMany({
				where: whereTendenciaPesado,
				select: { marca_temporal: true }
			});
			inspeccionesPesado.forEach(i => {
				const dia = i.marca_temporal.toISOString().slice(0, 10);
				tendenciaMap[dia] = (tendenciaMap[dia] || 0) + 1;
			});
		}
		
		const tendencia = Object.keys(tendenciaMap).sort().map(fecha => ({ fecha, count: tendenciaMap[fecha] }));

		// Conductores con más alertas (aplicando filtros)
		const conductorMap = {};
		
		if (incluirLigero) {
			const whereAlertasLigero = { ...whereLigero, tiene_alertas_criticas: true };
			const alertasLigero = await prisma.inspeccion.findMany({
				where: whereAlertasLigero,
				select: { conductor_nombre: true }
			});
			alertasLigero.forEach(a => {
				if (a.conductor_nombre) {
					conductorMap[a.conductor_nombre] = (conductorMap[a.conductor_nombre] || 0) + 1;
				}
			});
		}
		
		if (incluirPesado) {
			const whereAlertasPesado = { ...wherePesado, tiene_alertas_criticas: true };
			const alertasPesado = await prisma.inspeccionPesado.findMany({
				where: whereAlertasPesado,
				select: { nombre_inspector: true }
			});
			alertasPesado.forEach(a => {
				if (a.nombre_inspector) {
					conductorMap[a.nombre_inspector] = (conductorMap[a.nombre_inspector] || 0) + 1;
				}
			});
		}
		
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
