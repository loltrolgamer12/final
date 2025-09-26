const prisma = require('../config/database');
const XLSX = require('xlsx');

module.exports = {
  async getReporteExcel(req, res) {
    try {
      const { mes, ano, diaInicio, diaFin } = req.query;
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

      const inspecciones = await prisma.inspeccion.findMany({
        where: {
          fecha: { gte: desde, lt: hasta }
        }
      });
      if (!inspecciones.length) {
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
          conductor: i.conductor_nombre,
          fecha: new Date(i.fecha).toLocaleDateString(),
          motivo: i.consumo_medicamentos
            ? 'Consumo de medicamentos (crítico, no debe conducir)'
            : 'Fatiga reportada'
        }));

      // Vehículos advertencia
      const vehiculosAdvertencia = inspecciones
        .filter(i => i.observaciones && i.observaciones.length > 5)
        .map(i => ({
          placa: i.placa_vehiculo,
          fecha: new Date(i.fecha).toLocaleDateString(),
          motivo: i.observaciones
        }));

      // KPIs y totales para hoja Resumen
      const resumen = [
        { kpi: 'Total inspecciones', valor: inspecciones.length },
        { kpi: 'Alertas críticas', valor: inspecciones.filter(i => i.tiene_alertas_criticas).length },
        { kpi: 'Riesgo alto', valor: inspecciones.filter(i => i.nivel_riesgo === 'ALTO').length },
        { kpi: 'Riesgo medio', valor: inspecciones.filter(i => i.nivel_riesgo === 'MEDIO').length },
        { kpi: 'Riesgo bajo', valor: inspecciones.filter(i => i.nivel_riesgo === 'BAJO').length },
        { kpi: 'Conductores en advertencia', valor: conductoresAdvertencia.length },
        { kpi: 'Fatiga advertencia', valor: fatigaAdvertencia.length },
        { kpi: 'Vehículos advertencia', valor: vehiculosAdvertencia.length }
      ];

      // Crear workbook y hojas
      const workbook = XLSX.utils.book_new();
      // Hoja Resumen
      const wsResumen = XLSX.utils.json_to_sheet(resumen);
      XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
      // Hoja principal
      const wsInspecciones = XLSX.utils.json_to_sheet(inspecciones);
      XLSX.utils.book_append_sheet(workbook, wsInspecciones, 'Inspecciones');
      // Hoja conductores
      const wsConductores = XLSX.utils.json_to_sheet(conductoresAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsConductores, 'Conductores');
      // Hoja fatiga
      const wsFatiga = XLSX.utils.json_to_sheet(fatigaAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsFatiga, 'Fatiga');
      // Hoja vehículos
      const wsVehiculos = XLSX.utils.json_to_sheet(vehiculosAdvertencia);
      XLSX.utils.book_append_sheet(workbook, wsVehiculos, 'Vehículos');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${mes}_${ano}.xlsx`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};
