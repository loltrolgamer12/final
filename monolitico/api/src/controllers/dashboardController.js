const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  /**
   * getDashboard
   * Endpoint principal del dashboard ejecutivo.
   * Calcula KPIs, tendencias y top conductores para el tipo de camión ('ligero' o 'pesado').
   *
   * Query params:
   * - tipo: 'ligero' | 'pesado' (obligatorio)
   * - page, pageSize: paginación para tendencia de inspecciones
   *
   * Respuesta:
   * {
   *   totalInspecciones,
   *   totalAlertas,
   *   bajoRiesgo,
   *   medioRiesgo,
   *   altoRiesgo,
   *   tendencia: [{ fecha, count }],
   *   topConductores: [{ conductor_nombre, _count }]
   * }
   */
  async getDashboard(req, res) {
    try {
      let { tipo = 'ligero' } = req.query;
      tipo = String(tipo).toLowerCase();
      if (tipo !== 'ligero' && tipo !== 'pesado') {
        return responseUtils.errorResponse(res, 'DASHBOARD_ERROR', "El parámetro 'tipo' solo puede ser 'ligero' o 'pesado'.");
      }
      const tabla = tipo === 'pesado' ? prisma.inspeccionPesado : prisma.inspeccion;
      // KPIs principales
      const totalInspecciones = await tabla.count();
      const totalAlertas = await tabla.count({ where: { tiene_alertas_criticas: true } });
      const bajoRiesgo = await tabla.count({ where: { nivel_riesgo: 'BAJO' } });
      const medioRiesgo = await tabla.count({ where: { nivel_riesgo: 'MEDIO' } });
      const altoRiesgo = await tabla.count({ where: { nivel_riesgo: 'ALTO' } });

      // Tendencia de inspecciones por día (últimos 7 días) con paginación
      const desde = new Date();
      desde.setDate(desde.getDate() - 7);
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 100;
      const skip = (page - 1) * pageSize;
      const inspecciones = await tabla.findMany({
        where: { fecha: { gte: desde } },
        select: { fecha: true, id: true },
        skip,
        take: pageSize
      });
      // Agrupar por día (YYYY-MM-DD)
      const tendenciaMap = {};
      inspecciones.forEach(i => {
        const dia = i.fecha.toISOString().slice(0, 10);
        tendenciaMap[dia] = (tendenciaMap[dia] || 0) + 1;
      });
      const tendencia = Object.keys(tendenciaMap).sort().map(fecha => ({ fecha, count: tendenciaMap[fecha] }));

      // Conductores con más alertas
      const topConductores = await tabla.groupBy({
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
