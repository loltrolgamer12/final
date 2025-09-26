const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

// Componentes críticos para alerta de vehículo dañado
const componentesCriticos = [
  'frenos', 'frenos_emergencia', 'cinturones', 'vidrio_frontal', 'espejos', 'direccionales', 'limpiaparabrisas', 'altas_bajas'
];

function esComponenteCritico(inspeccion) {
  return componentesCriticos.some(c => inspeccion[c] === false);
}


module.exports = {
  async getAlerts(req, res) {
    try {
      const { tipo, fechaInicio, fechaFin } = req.query;
      const alertas = [];

      // 1. Conductores con fatiga (nivel de riesgo ALTO o puntaje fatiga bajo)
      const fatiga = await prisma.inspeccion.findMany({
        where: {
          OR: [
            { nivel_riesgo: 'ALTO' },
            { puntaje_fatiga: { lt: 2 } }
          ],
          ...(fechaInicio && fechaFin ? { fecha: { gte: new Date(fechaInicio), lte: new Date(fechaFin) } } : {})
        },
        orderBy: { fecha: 'desc' },
        take: 20
      });
      fatiga.forEach(i => {
        alertas.push({
          tipo: 'FATIGA',
          conductor: i.conductor_nombre,
          placa: i.placa_vehiculo,
          fecha: i.fecha,
          mensaje: `Riesgo de fatiga detectado para ${i.conductor_nombre} (${i.placa_vehiculo}) el ${i.fecha}`
        });
      });

      // 2. Vehículos dañados (componentes críticos en mal estado o observaciones relevantes)
      const vehiculos = await prisma.inspeccion.findMany({
        where: {
          OR: [
            ...componentesCriticos.map(c => ({ [c]: false })),
            { observaciones: { not: null } }
          ],
          ...(fechaInicio && fechaFin ? { fecha: { gte: new Date(fechaInicio), lte: new Date(fechaFin) } } : {})
        },
        orderBy: { fecha: 'desc' },
        take: 20
      });
      vehiculos.forEach(i => {
        if (esComponenteCritico(i)) {
          alertas.push({
            tipo: 'VEHICULO_CRITICO',
            placa: i.placa_vehiculo,
            fecha: i.fecha,
            mensaje: `Componente crítico en mal estado en vehículo ${i.placa_vehiculo} el ${i.fecha}`
          });
        }
      });

      // 3. Conductores sin inspección en los últimos 5 días
      const cincoDiasAtras = new Date();
      cincoDiasAtras.setDate(cincoDiasAtras.getDate() - 5);
      const conductores = await prisma.inspeccion.groupBy({
        by: ['conductor_nombre'],
        _max: { fecha: true }
      });
      conductores.forEach(c => {
        if (c._max.fecha < cincoDiasAtras) {
          alertas.push({
            tipo: 'CONDUCTOR_SIN_INSPECCION',
            conductor: c.conductor_nombre,
            fechaUltima: c._max.fecha,
            mensaje: `El conductor ${c.conductor_nombre} no tiene inspección desde ${c._max.fecha}`
          });
        }
      });

      return responseUtils.successResponse(res, alertas);
    } catch (error) {
      return responseUtils.errorResponse(res, 'ALERTS_ERROR', error.message);
    }
  }
};
