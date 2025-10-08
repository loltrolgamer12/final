const placaRegex = /^[A-Z]{2,4}\s?\d{2,5}$/i;
const fechaRegex = /^(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4})/;

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  // Para campos obligatorios: null/undefined se trata como false (valor por defecto)
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  if (v === "") return false; // Campo vacío = valor por defecto
  return false; // Valor desconocido = valor por defecto
}

function normalizeKilometraje(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value.replace(/\D/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

function normalizeFecha(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    // Intentar parsear varios formatos
    let d = new Date(value);
    if (!isNaN(d.getTime())) return d;
    // Si no, intentar reemplazar / por -
    d = new Date(value.replace(/\//g, '-'));
    if (!isNaN(d.getTime())) return d;
  }
  if (value instanceof Date) return value;
  return null;
}

function obtenerCamposInspeccion(tipo) {
  // Campos de inspección QUE REALMENTE EXISTEN en el mapeo
  const camposLigero = [
    // Luces
    'altas_bajas', 'direccionales', 'parqueo', 'freno', 'reversa',
    // Espejos y vidrios
    'espejos', 'vidrio_frontal', 'vidrios',
    // Condiciones generales
    'presentacion_aseo', 'pito', 'gps',
    // Frenos y cinturones
    'frenos', 'frenos_emergencia', 'cinturones',
    // Carrocería
    'puertas', 'limpiaparabrisas', 'extintor', 'botiquin', 'tapiceria', 'indicadores', 'objetos_sueltos',
    // Niveles de fluidos
    'nivel_aceite_motor', 'nivel_fluido_frenos', 'nivel_fluido_dir_hidraulica', 
    'nivel_fluido_refrigerante', 'nivel_fluido_limpia_parabrisas',
    // Motor y electricidad
    'correas', 'baterias',
    // Llantas
    'llantas_labrado', 'llantas_sin_cortes', 'llanta_repuesto', 'copas_pernos',
    // Suspensión y dirección
    'suspension', 'direccion',
    // Otros
    'tapa_tanque', 'equipo_carretera', 'kit_ambiental', 'documentacion'
  ];
  
  const camposPesado = [
    'luces_altas', 'luces_medias', 'luces_exploradoras', 'luces_parqueo',
    'luces_reversa', 'direccionales_delanteras', 'direccionales_traseras', 
    'luces_placa', 'stops', 'cinturon_seguridad', 'pito', 'alarma_reversa',
    'vidrio_panoramico', 'vidrios_laterales', 'espejos_retrovisores', 'limpiaparabrisas',
    'asiento', 'brazos_suspension_delanteros', 'bujes', 'rotulas', 'terminales_direccion',
    'estado_amortiguadores', 'fugas_amortiguadores', 'resortes', 'pasadores_pernos_grapas',
    'pernos_rin', 'birlos', 'tuercas', 'base_quinta_rueda', 'seguros_quinta_rueda',
    'brazos_suspension_traseros', 'gato', 'cruceta', 'extension', 'llave_ruedas',
    'tacos', 'conos', 'botiquin', 'extintor', 'kit_carretera', 'chaleco_reflectivo',
    'nivel_aceite_motor', 'nivel_refrigerante', 'fugas_motor', 'bandas', 'mangueras',
    'soportes_motor', 'bateria_estado', 'alternador', 'marcha', 'tanque_combustible',
    'llantas_labrado', 'caballete'
  ];
  
  return tipo === 'pesado' ? camposPesado : camposLigero;
}

module.exports = {
  validateRecord(record, tipo = 'ligero', strict = true) {
    const errors = [];
    const warnings = [];
    
    // VALIDACIÓN ÚNICA: Solo validar que la fecha sea válida
    // Todos los demás campos pueden estar vacíos
    const fechaValida = normalizeFecha(record.fecha);
    if (!fechaValida) {
      errors.push({ field: 'fecha', message: 'Fecha de inspección requerida o formato inválido' });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },
  normalizeBoolean,
  normalizeKilometraje,
  normalizeFecha
};
