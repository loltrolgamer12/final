const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  async getInspecciones(req, res) {
    try {
      const { limit = 10, alerta, riesgo, tipo = 'ligero' } = req.query;
      const where = {};
      if (alerta === 'true') where.tiene_alertas_criticas = true;
      if (riesgo) where.nivel_riesgo = riesgo;
      // Seleccionar tabla según tipo
      const tabla = tipo === 'pesado' ? prisma.inspeccionPesado : prisma.inspeccion;
      const inspecciones = await tabla.findMany({
        where,
        orderBy: { fecha: 'desc' },
        take: parseInt(limit)
      });
      return responseUtils.successResponse(res, inspecciones);
    } catch (error) {
      return responseUtils.errorResponse(res, 'INSPECCIONES_ERROR', error.message);
    }
  }
};
