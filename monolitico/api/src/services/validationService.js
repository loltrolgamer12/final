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
    'altas_bajas', 'direccionales', 'parqueo', 'freno', 'reversa',
    'espejos', 'vidrio_frontal', 'frenos', 'frenos_emergencia',
    'cinturones', 'puertas', 'vidrios', 'limpiaparabrisas'
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
      // Log de entrada de registro
      console.log('Validando registro (strict=' + strict + '):', JSON.stringify(record));
    
    if (strict) {
      // MODO ESTRICTO: Validar que TODOS los campos estén completos
      const nombreField = tipo === 'pesado' ? 'nombre_inspector' : 'conductor_nombre';
      
      // Validar campos obligatorios de texto
      if (!record.placa_vehiculo || record.placa_vehiculo.trim() === '') {
        errors.push({ field: 'placa_vehiculo', message: 'Placa requerida (no puede estar vacía)' });
      }
      if (!record[nombreField] || record[nombreField].trim() === '') {
        errors.push({ field: nombreField, message: 'Nombre requerido (no puede estar vacío)' });
      }
      if (!record.turno || record.turno.trim() === '') {
        errors.push({ field: 'turno', message: 'Turno requerido (no puede estar vacío)' });
      }
      
      // Validar fecha
      const fechaValida = normalizeFecha(record.fecha);
      if (!fechaValida) {
        errors.push({ field: 'fecha', message: 'Fecha de inspección requerida o formato inválido' });
      }
      
      // Validar kilometraje
      const km = normalizeKilometraje(record.kilometraje);
      if (km === 0) {
        errors.push({ field: 'kilometraje', message: 'Kilometraje requerido (no puede estar vacío o en 0)' });
      }
      
      // Validar que TODOS los campos booleanos existan y sean booleanos
      const camposCriticos = ['consumo_medicamentos','horas_sueno_suficientes','libre_sintomas_fatiga','condiciones_aptas'];
      camposCriticos.forEach(campo => {
        if (record[campo] === null || record[campo] === undefined) {
          errors.push({ field: campo, message: `${campo} requerido (no puede estar vacío)` });
        }
      });
      
      // Verificar que los campos de inspección que SÍ existen en el record no estén vacíos
      // Solo validamos los campos que realmente están en el schema/mapeo
      const camposInspeccion = obtenerCamposInspeccion(tipo);
      camposInspeccion.forEach(campo => {
        // Solo validar si el campo existe en el record (está en el mapeo)
        if (campo in record && (record[campo] === null || record[campo] === undefined)) {
          errors.push({ field: campo, message: `${campo} requerido (no puede estar vacío)` });
        }
      });
      
    } else {
      // MODO PERMISIVO: Solo advertencias
      if (!record.placa_vehiculo || record.placa_vehiculo.trim() === '') {
        console.log('Advertencia: Registro sin placa');
      }
      const nombreField = tipo === 'pesado' ? 'nombre_inspector' : 'conductor_nombre';
      if (!record[nombreField] || record[nombreField].trim() === '') {
        console.log('Advertencia: Registro sin nombre');
      }
      const fechaValida = normalizeFecha(record.fecha);
      if (!fechaValida) {
        errors.push({ field: 'fecha', message: 'Fecha de inspección requerida o formato inválido' });
      }
      ['consumo_medicamentos','horas_sueno_suficientes','libre_sintomas_fatiga','condiciones_aptas'].forEach(campo => {
        if (typeof record[campo] !== 'boolean') {
          console.log(`Advertencia: Campo ${campo} no es booleano`);
        }
      });
      const km = normalizeKilometraje(record.kilometraje);
      if (km === 0) {
        console.log('Advertencia: Kilometraje vacío o inválido');
      }
      if (!record.turno || !['DIURNA','NOCTURNA'].includes(record.turno.toUpperCase())) {
        console.log('Advertencia: Turno dudoso o vacío');
      }
    }
    
    // Log de resultado de validación
    if (errors.length > 0 || warnings.length > 0) {
      console.log('Resultado validación:', { errors, warnings });
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
