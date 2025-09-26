const path = require('path');
const pdfHtmlService = require('../services/pdfHtmlService');
const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  async getReportePDF(req, res) {
    try {
      const { mes, ano } = req.query;
      if (!mes || !ano) return responseUtils.errorResponse(res, 'PDF_ERROR', 'Mes y año requeridos');
      const desde = new Date(`${ano}-${mes}-01`);
      const hasta = new Date(desde);
      hasta.setMonth(hasta.getMonth() + 1);
      const inspecciones = await prisma.inspeccion.findMany({
        where: {
          fecha: { gte: desde, lt: hasta }
        }
      });
      // Mensajes detallados
      const conductores = {};
      inspecciones.forEach(i => {
        if (!conductores[i.conductor_nombre] || conductores[i.conductor_nombre] < i.fecha) {
          conductores[i.conductor_nombre] = i.fecha;
        }
      });
      const hoy = new Date();
      const incumplimientoMensajes = Object.entries(conductores)
        .filter(([nombre, fecha]) => (hoy - new Date(fecha)) / (1000*60*60*24) > 7)
        .map(([nombre, fecha]) => `El conductor ${nombre} lleva más de 7 días sin hacer reportes. Su última inspección fue el ${new Date(fecha).toLocaleDateString()}`);

      const fatigaMensajes = inspecciones.filter(i => i.nivel_riesgo === 'ALTO' || i.consumo_medicamentos)
        .map(i => {
          if (i.consumo_medicamentos) {
            return `El conductor ${i.conductor_nombre} reportó consumo de medicamentos el ${new Date(i.fecha).toLocaleDateString()}. Es crítico, no debe conducir.`;
          }
          return `Advertencia: El conductor ${i.conductor_nombre} reportó fatiga el ${new Date(i.fecha).toLocaleDateString()}.`;
        });

      const vehiculoMensajes = inspecciones.filter(i => i.observaciones && i.observaciones.length > 5)
        .map(i => `El vehículo con placa ${i.placa_vehiculo} tiene fallas: ${i.observaciones}. Reportado por el mecánico el ${new Date(i.fecha).toLocaleDateString()}`);

      const totalInspecciones = inspecciones.length;
      const totalAlertas = inspecciones.filter(i => i.tiene_alertas_criticas).length;
      const riesgoAlto = inspecciones.filter(i => i.nivel_riesgo === 'ALTO').length;
      const riesgoMedio = inspecciones.filter(i => i.nivel_riesgo === 'MEDIO').length;
      const riesgoBajo = inspecciones.filter(i => i.nivel_riesgo === 'BAJO').length;

      // Generar PDF usando HTML y Puppeteer
      const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const mesNombre = mesesNombres[parseInt(mes,10)-1] || mes;
      const logoPath = path.join(__dirname, '../../public/logo.jpeg');
      const fechaGeneracion = new Date().toLocaleDateString();
      const html = await pdfHtmlService.renderHtmlReporte({
        mes: mesNombre,
        ano,
        // logoPath: `file://${logoPath}`,
        fechaGeneracion,
        totalInspecciones,
        incumplimientoMensajes,
        fatigaMensajes,
        vehiculoMensajes,
        totalAlertas,
        riesgoAlto,
        riesgoMedio,
        riesgoBajo
      });
      console.log('HTML generado para PDF:', html);
      const pdfBuffer = await pdfHtmlService.generarPdfDesdeHtml(html);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${mesNombre}_${ano}.pdf`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      return responseUtils.errorResponse(res, 'PDF_ERROR', error.message);
    }
  }
};
