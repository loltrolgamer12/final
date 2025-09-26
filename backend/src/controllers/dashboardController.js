const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  async getDashboard(req, res) {
    try {
      // KPIs principales
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
        select: { fecha: true, id: true }
      });
      // Agrupar por día (YYYY-MM-DD)
      const tendenciaMap = {};
      inspecciones.forEach(i => {
        const dia = i.fecha.toISOString().slice(0, 10);
        tendenciaMap[dia] = (tendenciaMap[dia] || 0) + 1;
      });
      const tendencia = Object.keys(tendenciaMap).sort().map(fecha => ({ fecha, count: tendenciaMap[fecha] }));

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
  }
};
