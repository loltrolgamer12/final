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

      // Seleccionar tabla según tipo
      const tabla = tipo === 'pesado' ? prisma.inspeccionPesado : prisma.inspeccion;
      // 1. Conductores con fatiga (nivel de riesgo ALTO o puntaje fatiga bajo)
      const fatiga = await tabla.findMany({
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
        // Motivo detallado de fatiga
        let motivos = [];
        if (i.consumo_medicamentos) motivos.push('Consumo de medicamentos');
        if (i.horas_sueno_suficientes === false) motivos.push('Falta de sueño');
        if (i.libre_sintomas_fatiga === false) motivos.push('Síntomas de fatiga');
        if (i.condiciones_aptas === false) motivos.push('No apto para conducir');
        if (i.puntaje_fatiga < 2) motivos.push('Puntaje de fatiga bajo');
        if (i.nivel_riesgo === 'ALTO' && motivos.length === 0) motivos.push('Riesgo alto detectado');
        alertas.push({
          tipo: 'FATIGA',
          conductor: i.conductor_nombre,
          placa: i.placa_vehiculo,
          fecha: i.fecha,
          motivo: motivos.join(', '),
          mensaje: `Riesgo de fatiga para ${i.conductor_nombre} (${i.placa_vehiculo})${motivos.length ? ': ' + motivos.join(', ') : ''} el ${new Date(i.fecha).toLocaleDateString()}`
        });
      });

      // 2. Vehículos dañados (componentes críticos en mal estado o observaciones relevantes)
      const vehiculos = await tabla.findMany({
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
          // Buscar qué componente(s) fallaron
          let componentesMal = componentesCriticos.filter(c => i[c] === false);
          let motivo = componentesMal.length ? `Componentes: ${componentesMal.join(', ')}` : '';
          if (i.observaciones) motivo += (motivo ? '; ' : '') + `Observaciones: ${i.observaciones}`;
          alertas.push({
            tipo: 'VEHICULO_CRITICO',
            placa: i.placa_vehiculo,
            fecha: i.fecha,
            motivo,
            mensaje: `Advertencia en vehículo ${i.placa_vehiculo}${motivo ? ': ' + motivo : ''} el ${new Date(i.fecha).toLocaleDateString()}`
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
