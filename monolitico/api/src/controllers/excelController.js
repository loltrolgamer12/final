const prisma = require('../config/database');
const XLSX = require('xlsx');
const { getMotivoCriticoDetallado, getMotivoCriticoDetalladoPesado } = require('../utils/responseUtils');

module.exports = {
  async getReporteExcel(req, res) {
    try {
      const { mes, ano, diaInicio, diaFin, tipo = 'ligero', contrato, campo } = req.query;
      if (!mes || !ano) {
        return res.status(400).json({ error: 'Mes y año requeridos' });
      }
      // Si no se envía día, usar todo el mes
      // Formatear mes y día a dos dígitos
      const pad = v => v.toString().padStart(2, '0');
      let desde, hasta;
      if (diaInicio) {
        const mesStr = pad(mes);
        const diaIniStr = pad(diaInicio);
        desde = new Date(`${ano}-${mesStr}-${diaIniStr}`);
        if (diaFin) {
          const diaFinStr = pad(diaFin);
          hasta = new Date(`${ano}-${mesStr}-${diaFinStr}`);
          // Para incluir el díaFin completo, sumamos 1 día
          hasta.setDate(hasta.getDate() + 1);
        } else {
          // Solo un día
          hasta = new Date(desde);
          hasta.setDate(hasta.getDate() + 1);
        }
      } else {
        // Todo el mes
        const mesStr = pad(mes);
        desde = new Date(`${ano}-${mesStr}-01`);
        hasta = new Date(desde);
        hasta.setMonth(hasta.getMonth() + 1);
      }

      // Determinar qué tabla(s) consultar basado en el tipo
      const usarLigero = tipo === 'ligero' || tipo === 'todos';
      const usarPesado = tipo === 'pesado' || tipo === 'todos';

      // Construir filtro común
      const whereComun = {
        fecha: { gte: desde, lt: hasta }
      };
      if (contrato) whereComun.contrato = contrato;
      if (campo) whereComun.campo_coordinacion = campo;

      // Consultar inspecciones según tipo
      let inspecciones = [];
      let rechazados = [];

      if (usarLigero) {
        const inspeccionesLigero = await prisma.inspeccion.findMany({
          where: whereComun
        });
        inspecciones = inspecciones.concat(inspeccionesLigero.map(i => ({ ...i, _tipo: 'ligero' })));

        const rechazadosLigero = await prisma.rechazoInspeccion.findMany({
          where: {
            OR: [
              { fecha: { gte: desde, lt: hasta } },
              { marca_temporal: { gte: desde, lt: hasta } }
            ]
          }
        });
        rechazados = rechazados.concat(rechazadosLigero.map(r => ({ ...r, _tipo: 'ligero' })));
      }

      if (usarPesado) {
        const inspeccionesPesado = await prisma.inspeccionPesado.findMany({
          where: whereComun
        });
        inspecciones = inspecciones.concat(inspeccionesPesado.map(i => ({ ...i, _tipo: 'pesado' })));

        const rechazadosPesado = await prisma.rechazoInspeccionPesado.findMany({
          where: {
            OR: [
              { fecha: { gte: desde, lt: hasta } },
              { marca_temporal: { gte: desde, lt: hasta } }
            ]
          }
        });
        rechazados = rechazados.concat(rechazadosPesado.map(r => ({ ...r, _tipo: 'pesado' })));
      }

      if (!inspecciones.length && !rechazados.length) {
        return res.status(404).json({ error: 'No hay datos para ese rango' });
      }

      // Conductores en advertencia (más de 7 días sin inspección)
      const conductores = {};
      inspecciones.forEach(i => {
        if (!conductores[i.conductor_nombre] || conductores[i.conductor_nombre] < i.fecha) {
          conductores[i.conductor_nombre] = i.fecha;
        }
      });
      const hoy = new Date();
      const conductoresAdvertencia = Object.entries(conductores)
        .filter(([_, fecha]) => (hoy - new Date(fecha)) / (1000 * 60 * 60 * 24) > 7)
        .map(([nombre, fecha]) => ({
          conductor: nombre,
          motivo: `Más de 7 días sin inspección. Última: ${new Date(fecha).toLocaleDateString()}`
        }));

      // Fatiga advertencia
      const fatigaAdvertencia = inspecciones
        .filter(i => i.nivel_riesgo === 'ALTO' || i.consumo_medicamentos)
        .map(i => ({
          tipo: i._tipo === 'pesado' ? 'Pesado' : 'Ligero',
          conductor: i.conductor_nombre,
          fecha: new Date(i.fecha).toLocaleDateString(),
          motivo: i.consumo_medicamentos
            ? 'Consumo de medicamentos (crítico, no debe conducir)'
            : 'Fatiga reportada'
        }));

      // Vehículos advertencia - SEPARADOS por tipo
      // LIGEROS: Todos los campos del vehículo ligero
      const vehiculosAdvertenciaLigero = inspecciones
        .filter(i => i._tipo === 'ligero')
        .filter(i => {
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
          return camposVehiculo.some(c => i[c] === false);
        })
        .map(i => ({
          tipo: 'Ligero',
          placa: i.placa_vehiculo,
          fecha: new Date(i.fecha).toLocaleDateString(),
          conductor: i.conductor_nombre,
          motivo: getMotivoCriticoDetallado(i)
        }));

      // PESADOS: Todos los campos del vehículo pesado
      const vehiculosAdvertenciaPesado = inspecciones
        .filter(i => i._tipo === 'pesado')
        .filter(i => {
          const camposVehiculoPesado = [
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
            // Llantas (3mm para pesados)
            'llantas_labrado', 'llantas_sin_cortes', 'llanta_repuesto', 'copas_pernos',
            // Suspensión y dirección
            'suspension', 'direccion',
            // Otros
            'tapa_tanque', 'equipo_carretera', 'kit_ambiental', 'documentacion',
            // ESPECÍFICOS DE PESADOS - Sistema de aire móvil 100
            'aire_compresor', 'aire_mangueras', 'aire_tanque', 'aire_secador'
          ];
          return camposVehiculoPesado.some(c => i[c] === false);
        })
        .map(i => ({
          tipo: 'Pesado',
          placa: i.placa_vehiculo,
          fecha: new Date(i.fecha).toLocaleDateString(),
          conductor: i.conductor_nombre,
          motivo: getMotivoCriticoDetalladoPesado(i)
        }));

      // Combinar advertencias de ligeros y pesados
      const vehiculosAdvertencia = [...vehiculosAdvertenciaLigero, ...vehiculosAdvertenciaPesado];

      // KPIs y totales para hoja Resumen
      const resumen = [
        { kpi: 'Tipo de vehículos', valor: tipo === 'todos' ? 'Ligeros y Pesados' : (tipo === 'pesado' ? 'Pesados' : 'Ligeros') },
        { kpi: 'Total inspecciones', valor: inspecciones.length },
        { kpi: 'Inspecciones ligeros', valor: inspecciones.filter(i => i._tipo === 'ligero').length },
        { kpi: 'Inspecciones pesados', valor: inspecciones.filter(i => i._tipo === 'pesado').length },
        { kpi: 'Alertas críticas', valor: inspecciones.filter(i => i.tiene_alertas_criticas).length },
        { kpi: 'Riesgo alto', valor: inspecciones.filter(i => i.nivel_riesgo === 'ALTO').length },
        { kpi: 'Riesgo medio', valor: inspecciones.filter(i => i.nivel_riesgo === 'MEDIO').length },
        { kpi: 'Riesgo bajo', valor: inspecciones.filter(i => i.nivel_riesgo === 'BAJO').length },
        { kpi: 'Conductores en advertencia', valor: conductoresAdvertencia.length },
        { kpi: 'Fatiga advertencia', valor: fatigaAdvertencia.length },
        { kpi: 'Vehículos advertencia', valor: vehiculosAdvertencia.length }
      ];

      // Crear workbook y hojas con mejoras de claridad y usabilidad
      const workbook = XLSX.utils.book_new();

      // Hoja Leyenda
      const leyenda = [
        { Campo: 'Resumen', Descripcion: 'KPIs y totales generales del periodo (ligeros y/o pesados).' },
        { Campo: 'Inspecciones', Descripcion: 'Todas las inspecciones válidas registradas (indica tipo).' },
        { Campo: 'Rechazados', Descripcion: 'Registros rechazados por validación o duplicado, con motivo (indica tipo).' },
        { Campo: 'Conductores', Descripcion: 'Conductores en advertencia por inactividad.' },
        { Campo: 'Fatiga', Descripcion: 'Conductores con fatiga o consumo de medicamentos (indica tipo).' },
        { Campo: 'Vehículos', Descripcion: 'Vehículos con advertencias críticas (indica tipo y TODOS los componentes fallados).' },
        { Campo: 'Tipo', Descripcion: 'Ligero (2mm labrado) o Pesado (3mm labrado, incluye sistema aire móvil 100).' },
        { Campo: 'Campos comunes', Descripcion: 'Fecha de Inspección, Nombre del Conductor, Placa del Vehículo, Nivel de Riesgo, etc.' },
        { Campo: 'Motivo', Descripcion: 'Explicación DETALLADA del motivo de advertencia, rechazo o fatiga (TODOS los componentes fallados).' },
        { Campo: 'Colores', Descripcion: 'Rojo: Crítico/Rechazado. Azul: Cumplimiento. Naranja: Advertencia.' }
      ];
      const wsLeyenda = XLSX.utils.json_to_sheet(leyenda);
      XLSX.utils.book_append_sheet(workbook, wsLeyenda, 'Leyenda');

      // Hoja Resumen (ya amigable)
      const wsResumen = XLSX.utils.json_to_sheet(resumen);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');

      // Hoja Inspecciones (renombrar columnas)
      if (inspecciones.length) {
        const inspeccionesAmigable = inspecciones.map(i => ({
          'Tipo': i._tipo === 'pesado' ? 'Pesado' : 'Ligero',
          'Fecha de Inspección': new Date(i.fecha).toLocaleDateString(),
          'Nombre del Conductor': i.conductor_nombre,
          'Placa del Vehículo': i.placa_vehiculo,
          'Nivel de Riesgo': i.nivel_riesgo,
          'Alertas Críticas': i.tiene_alertas_criticas ? 'Sí' : 'No',
          'Puntaje Fatiga': i.puntaje_fatiga,
          'Consumo Medicamentos': i.consumo_medicamentos ? 'Sí' : 'No',
          'Condiciones Aptas': i.condiciones_aptas ? 'Sí' : 'No',
          'Observaciones': i.observaciones || ''
        }));
        // Agregar totales al final
        inspeccionesAmigable.push({
          'Tipo': 'TOTALES:',
          'Fecha de Inspección': '',
          'Nombre del Conductor': '',
          'Placa del Vehículo': '',
          'Nivel de Riesgo': '',
          'Alertas Críticas': inspecciones.filter(i => i.tiene_alertas_criticas).length,
          'Puntaje Fatiga': '',
          'Consumo Medicamentos': '',
          'Condiciones Aptas': '',
          'Observaciones': ''
        });
        const wsInspecciones = XLSX.utils.json_to_sheet(inspeccionesAmigable);
        XLSX.utils.book_append_sheet(workbook, wsInspecciones, 'Inspecciones');
      }

      // Hoja Rechazados (renombrar columnas y motivo)
      if (rechazados.length) {
        const rechazadosAmigable = rechazados.map(r => ({
          'Tipo': r._tipo === 'pesado' ? 'Pesado' : 'Ligero',
          'Fecha de Registro': r.fecha ? new Date(r.fecha).toLocaleDateString() : '',
          'Nombre del Conductor': r.conductor_nombre,
          'Placa del Vehículo': r.placa_vehiculo,
          'Motivo de Rechazo': r.motivo_rechazo,
          'Observaciones': r.observaciones || ''
        }));
        const wsRechazados = XLSX.utils.json_to_sheet(rechazadosAmigable);
        XLSX.utils.book_append_sheet(workbook, wsRechazados, 'Rechazados');
      }

      // Hoja Conductores (ya amigable)
      const wsConductores = XLSX.utils.json_to_sheet(conductoresAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsConductores, 'Conductores');

      // Hoja Fatiga (ya amigable)
      const wsFatiga = XLSX.utils.json_to_sheet(fatigaAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsFatiga, 'Fatiga');

      // Hoja Vehículos (ya amigable)
      const wsVehiculos = XLSX.utils.json_to_sheet(vehiculosAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsVehiculos, 'Vehículos');

      // Congelar encabezados en todas las hojas
      Object.values(workbook.Sheets).forEach(ws => {
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };
      });

      // NOTA: XLSX (SheetJS) no soporta formato condicional avanzado en openxml, pero los colores pueden aplicarse manualmente en Excel.

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${mes}_${ano}.xlsx`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
