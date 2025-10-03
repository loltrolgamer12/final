
function getMotivoCriticoDetallado(inspeccion) {
  if (!inspeccion) return '';
  
  // TODOS los campos del vehículo ligero
  const campos = [
    { campo: 'altas_bajas', nombre: 'Luces altas/bajas' },
    { campo: 'direccionales', nombre: 'Direccionales' },
    { campo: 'parqueo', nombre: 'Luces de parqueo' },
    { campo: 'freno', nombre: 'Luces de freno' },
    { campo: 'reversa', nombre: 'Luces de reversa' },
    { campo: 'espejos', nombre: 'Espejos' },
    { campo: 'vidrio_frontal', nombre: 'Vidrio frontal' },
    { campo: 'frenos', nombre: 'Frenos' },
    { campo: 'frenos_emergencia', nombre: 'Freno de emergencia' },
    { campo: 'cinturones', nombre: 'Cinturones' },
    { campo: 'puertas', nombre: 'Puertas' },
    { campo: 'vidrios', nombre: 'Vidrios' },
    { campo: 'limpiaparabrisas', nombre: 'Limpiaparabrisas' }
  ];
  
  // Solo mostrar los que tienen falla (false)
  const fallas = campos
    .filter(c => inspeccion[c.campo] === false)
    .map(c => c.nombre);
  
  if (fallas.length === 0) {
    return 'Sin fallas mecánicas detectadas';
  }
  
  return 'Fallas: ' + fallas.join(', ');
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
