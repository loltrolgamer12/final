
function getMotivoCriticoDetallado(inspeccion) {
  if (!inspeccion) return '';
  
  // TODOS los campos del vehículo ligero (50 campos de inspección)
  const campos = [
    // Luces
    { campo: 'altas_bajas', nombre: 'Luces altas/bajas' },
    { campo: 'direccionales', nombre: 'Direccionales' },
    { campo: 'parqueo', nombre: 'Luces de parqueo' },
    { campo: 'freno', nombre: 'Luces de freno' },
    { campo: 'reversa', nombre: 'Luces de reversa' },
    // Espejos y vidrios
    { campo: 'espejos', nombre: 'Espejos' },
    { campo: 'vidrio_frontal', nombre: 'Vidrio frontal' },
    { campo: 'vidrios', nombre: 'Vidrios' },
    // Condiciones generales
    { campo: 'presentacion_aseo', nombre: 'Presentación y aseo' },
    { campo: 'pito', nombre: 'Pito' },
    { campo: 'gps', nombre: 'GPS' },
    // Frenos y cinturones
    { campo: 'frenos', nombre: 'Frenos' },
    { campo: 'frenos_emergencia', nombre: 'Freno de emergencia' },
    { campo: 'cinturones', nombre: 'Cinturones' },
    // Carrocería
    { campo: 'puertas', nombre: 'Puertas' },
    { campo: 'limpiaparabrisas', nombre: 'Limpiaparabrisas' },
    { campo: 'extintor', nombre: 'Extintor' },
    { campo: 'botiquin', nombre: 'Botiquín' },
    { campo: 'tapiceria', nombre: 'Tapicería' },
    { campo: 'indicadores', nombre: 'Indicadores' },
    { campo: 'objetos_sueltos', nombre: 'Objetos sueltos' },
    // Niveles de fluidos
    { campo: 'nivel_aceite_motor', nombre: 'Nivel aceite motor' },
    { campo: 'nivel_fluido_frenos', nombre: 'Nivel fluido frenos' },
    { campo: 'nivel_fluido_dir_hidraulica', nombre: 'Nivel fluido dirección' },
    { campo: 'nivel_fluido_refrigerante', nombre: 'Nivel refrigerante' },
    { campo: 'nivel_fluido_limpia_parabrisas', nombre: 'Nivel limpia parabrisas' },
    // Motor y electricidad
    { campo: 'correas', nombre: 'Correas' },
    { campo: 'baterias', nombre: 'Baterías' },
    // Llantas
    { campo: 'llantas_labrado', nombre: 'Llantas labrado' },
    { campo: 'llantas_sin_cortes', nombre: 'Llantas sin cortes' },
    { campo: 'llanta_repuesto', nombre: 'Llanta de repuesto' },
    { campo: 'copas_pernos', nombre: 'Copas/pernos' },
    // Suspensión y dirección
    { campo: 'suspension', nombre: 'Suspensión' },
    { campo: 'direccion', nombre: 'Dirección' },
    // Otros
    { campo: 'tapa_tanque', nombre: 'Tapa de tanque' },
    { campo: 'equipo_carretera', nombre: 'Equipo de carretera' },
    { campo: 'kit_ambiental', nombre: 'Kit ambiental' },
    { campo: 'documentacion', nombre: 'Documentación' }
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

function getMotivoCriticoDetalladoPesado(inspeccion) {
  if (!inspeccion) return '';
  
  // TODOS los campos del vehículo pesado
  const campos = [
    // Luces
    { campo: 'altas_bajas', nombre: 'Luces altas/bajas' },
    { campo: 'direccionales', nombre: 'Direccionales' },
    { campo: 'parqueo', nombre: 'Luces de parqueo' },
    { campo: 'freno', nombre: 'Luces de freno' },
    { campo: 'reversa_alarma', nombre: 'Reversa y alarma' },
    // Espejos y vidrios
    { campo: 'espejos', nombre: 'Espejos' },
    { campo: 'vidrio_frontal', nombre: 'Vidrio frontal' },
    { campo: 'vidrios', nombre: 'Vidrios' },
    // Condiciones generales
    { campo: 'presentacion_aseo', nombre: 'Presentación y aseo' },
    { campo: 'pito', nombre: 'Pito' },
    { campo: 'gps', nombre: 'GPS' },
    // Frenos y cinturones
    { campo: 'frenos', nombre: 'Frenos' },
    { campo: 'frenos_emergencia', nombre: 'Freno de emergencia' },
    { campo: 'cinturones', nombre: 'Cinturones' },
    // Carrocería
    { campo: 'puertas', nombre: 'Puertas' },
    { campo: 'limpiaparabrisas', nombre: 'Limpiaparabrisas' },
    { campo: 'extintor', nombre: 'Extintor' },
    { campo: 'botiquin', nombre: 'Botiquín' },
    { campo: 'tapiceria', nombre: 'Tapicería' },
    { campo: 'indicadores', nombre: 'Indicadores' },
    { campo: 'objetos_sueltos', nombre: 'Objetos sueltos' },
    // Sistemas de aire (móvil 100)
    { campo: 'fugas_aire', nombre: 'Fugas de aire' },
    { campo: 'control_fugas_aire', nombre: 'Control fugas aire' },
    { campo: 'candados_bandas', nombre: 'Candados y bandas' },
    { campo: 'acoples_tomas', nombre: 'Acoples eléctricos/aire' },
    // Niveles de fluidos
    { campo: 'nivel_aceite_motor', nombre: 'Nivel aceite motor' },
    { campo: 'nivel_fluido_frenos', nombre: 'Nivel fluido frenos' },
    { campo: 'nivel_fluido_dir_hidraulica', nombre: 'Nivel fluido dirección' },
    { campo: 'nivel_fluido_refrigerante', nombre: 'Nivel refrigerante' },
    { campo: 'nivel_fluido_limpia_parabrisas', nombre: 'Nivel limpia parabrisas' },
    // Motor y electricidad
    { campo: 'correas', nombre: 'Correas' },
    { campo: 'baterias', nombre: 'Baterías' },
    // Llantas
    { campo: 'llantas_labrado', nombre: 'Llantas labrado (min 3mm)' },
    { campo: 'llantas_sin_cortes', nombre: 'Llantas sin cortes/abultamientos' },
    { campo: 'llanta_repuesto', nombre: 'Llanta de repuesto' },
    { campo: 'copas_pernos', nombre: 'Copas/pernos' },
    // Suspensión y dirección
    { campo: 'suspension', nombre: 'Suspensión' },
    { campo: 'direccion', nombre: 'Dirección' },
    // Otros
    { campo: 'tapa_tanque', nombre: 'Tapa de tanque' },
    { campo: 'equipo_carretera', nombre: 'Equipo de carretera' },
    { campo: 'kit_ambiental', nombre: 'Kit ambiental' },
    { campo: 'documentacion', nombre: 'Documentación' }
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
  getMotivoCriticoDetallado,
  getMotivoCriticoDetalladoPesado
};
