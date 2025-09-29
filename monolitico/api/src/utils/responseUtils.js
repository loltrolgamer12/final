
function getMotivoCriticoDetallado(inspeccion) {
  if (!inspeccion) return '';
  const campos = [
    { campo: 'frenos', nombre: 'Frenos' },
    { campo: 'frenos_emergencia', nombre: 'Freno de emergencia' },
    { campo: 'cinturones', nombre: 'Cinturones' },
    { campo: 'vidrio_frontal', nombre: 'Vidrio frontal' },
    { campo: 'espejos', nombre: 'Espejos' },
    { campo: 'direccionales', nombre: 'Direccionales' },
    { campo: 'limpiaparabrisas', nombre: 'Limpiaparabrisas' },
    { campo: 'altas_bajas', nombre: 'Luces altas/bajas' },
    { campo: 'llantas', nombre: 'Llantas' },
    { campo: 'testigo', nombre: 'Testigo encendido' }
  ];
  const detalles = campos.map(c => `${c.nombre}: ${inspeccion[c.campo] === false ? 'Falla' : 'OK'}`);
  let extra = [];
  if (inspeccion.observaciones) extra.push('Observaciones: ' + inspeccion.observaciones);
  return [...detalles, ...extra].join(' | ');
}

module.exports = {
  successResponse(res, data) {
    return res.status(200).json({ success: true, data });
  },
  errorResponse(res, code, message) {
    return res.status(400).json({ success: false, error: { code, message } });
  },
  getMotivoCriticoDetallado
};
