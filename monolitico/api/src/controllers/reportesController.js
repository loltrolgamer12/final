const prisma = require('../config/database');
const responseUtils = require('../utils/responseUtils');

module.exports = {
  async getReporte(req, res) {
    try {
      const { mes, ano, diaInicio, diaFin } = req.query;
      if (!mes || !ano) {
        return responseUtils.errorResponse(res, 'REPORTE_ERROR', 'Mes y año requeridos');
      }

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
          hasta.setDate(hasta.getDate() + 1);
        } else {
          hasta = new Date(desde);
          hasta.setDate(hasta.getDate() + 1);
        }
      } else {
        const mesStr = pad(mes);
        desde = new Date(`${ano}-${mesStr}-01`);
        hasta = new Date(desde);
        hasta.setMonth(hasta.getMonth() + 1);
      }

      // Inspecciones en el rango
      const { tipo = 'ligero', contrato, campo } = req.query;
      
      // Construir filtro común
      const whereComun = {
        fecha: { gte: desde, lt: hasta }
      };
      if (contrato) whereComun.contrato = contrato;
      if (campo) whereComun.campo_coordinacion = campo;

      // Consultar inspecciones según tipo
      let inspecciones = [];
      const usarLigero = tipo === 'ligero' || tipo === 'todos';
      const usarPesado = tipo === 'pesado' || tipo === 'todos';

      if (usarLigero) {
        const inspeccionesLigero = await prisma.inspeccion.findMany({ where: whereComun });
        inspecciones = inspecciones.concat(inspeccionesLigero.map(i => ({ ...i, _tipo: 'ligero' })));
      }

      if (usarPesado) {
        const inspeccionesPesado = await prisma.inspeccionPesado.findMany({ where: whereComun });
        inspecciones = inspecciones.concat(inspeccionesPesado.map(i => ({ ...i, _tipo: 'pesado' })));
      }

      // Incumplimiento de conductores
      const conductores = {};
      inspecciones.forEach(i => {
        if (!conductores[i.conductor_nombre] || conductores[i.conductor_nombre] < i.fecha) {
          conductores[i.conductor_nombre] = i.fecha;
        }
      });

      const hoy = new Date();
      const incumplimientoMensajes = Object.entries(conductores)
        .filter(([_, fecha]) => (hoy - new Date(fecha)) / (1000 * 60 * 60 * 24) > 7)
        .map(([nombre, fecha]) =>
          `El conductor ${nombre} lleva más de 7 días sin hacer reportes. Su última inspección fue el ${new Date(fecha).toLocaleDateString()}`
        );

      // Fatiga
      const fatigaMensajes = inspecciones
        .filter(i => i.nivel_riesgo === 'ALTO' || i.consumo_medicamentos)
        .map(i => {
          if (i.consumo_medicamentos) {
            return `El conductor ${i.conductor_nombre} reportó consumo de medicamentos el ${new Date(i.fecha).toLocaleDateString()}. Es crítico, no debe conducir.`;
          }
          return `Advertencia: El conductor ${i.conductor_nombre} reportó fatiga el ${new Date(i.fecha).toLocaleDateString()}.`;
        });

      // Vehículos
      const vehiculoMensajes = inspecciones
        .filter(i => i.observaciones && i.observaciones.length > 5)
        .map(i =>
          `El vehículo con placa ${i.placa_vehiculo} tiene fallas: ${i.observaciones}. Reportado el ${new Date(i.fecha).toLocaleDateString()}`
        );

      // KPIs
      const totalInspecciones = inspecciones.length;
      const totalAlertas = inspecciones.filter(i => i.tiene_alertas_criticas).length;
      const riesgoAlto = inspecciones.filter(i => i.nivel_riesgo === 'ALTO').length;
      const riesgoMedio = inspecciones.filter(i => i.nivel_riesgo === 'MEDIO').length;
      const riesgoBajo = inspecciones.filter(i => i.nivel_riesgo === 'BAJO').length;

      return responseUtils.successResponse(res, {
        totalInspecciones,
        incumplimientoMensajes,
        fatigaMensajes,
        vehiculoMensajes,
        totalAlertas,
        riesgoAlto,
        riesgoMedio,
        riesgoBajo
      });
    } catch (error) {
      return responseUtils.errorResponse(res, 'REPORTE_ERROR', error.message);
    }
  }
};
