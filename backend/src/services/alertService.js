// Servicio para generación de alertas
const prisma = require('../config/database');

module.exports = {
  async generarAlertasPorInspeccion(inspeccion) {
    const alertas = [];
    // Regla: Si nivel de riesgo es ALTO, crear alerta crítica
    if (inspeccion.nivel_riesgo === 'ALTO') {
      alertas.push({
        tipo: 'CRITICA',
        mensaje: `Riesgo ALTO de fatiga para conductor ${inspeccion.conductor_nombre} (${inspeccion.placa_vehiculo}) el ${inspeccion.fecha}`
      });
    }
    // Regla: Si puntaje de fatiga es bajo, crear alerta informativa
    if (inspeccion.puntaje_fatiga < 2) {
      alertas.push({
        tipo: 'INFORMATIVA',
        mensaje: `Puntaje de fatiga bajo para conductor ${inspeccion.conductor_nombre} (${inspeccion.placa_vehiculo}) el ${inspeccion.fecha}`
      });
    }
    // Regla: Si hay observaciones relevantes
    if (inspeccion.observaciones && inspeccion.observaciones.length > 10) {
      alertas.push({
        tipo: 'OBSERVACION',
        mensaje: `Observación: ${inspeccion.observaciones}`
      });
    }
    // Guardar alertas en BD si se requiere
    // await prisma.alerta.createMany({ data: alertas.map(a => ({ ...a, inspeccionId: inspeccion.id })) });
    return alertas;
  }
};
