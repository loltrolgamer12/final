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

module.exports = {
  validateRecord(record, tipo = 'ligero') {
    const errors = [];
    const warnings = [];
      // Log de entrada de registro
      console.log('Validando registro:', JSON.stringify(record));
    // Solo advertencias para placa (sin validar formato)
    if (!record.placa_vehiculo || record.placa_vehiculo.trim() === '') {
      console.log('Advertencia: Registro sin placa');
    }
    // Solo advertencias para conductor/inspector (sin validar longitud)
    const nombreField = tipo === 'pesado' ? 'nombre_inspector' : 'conductor_nombre';
    if (!record[nombreField] || record[nombreField].trim() === '') {
      console.log('Advertencia: Registro sin nombre');
    }
    // Validar fecha (mantener esta validación básica)
    const fechaValida = normalizeFecha(record.fecha);
    if (!fechaValida) {
      errors.push({ field: 'fecha', message: 'Fecha de inspección requerida o formato inválido' });
    }
    // Validar campos críticos de fatiga (solo logs, sin warnings)
    ['consumo_medicamentos','horas_sueno_suficientes','libre_sintomas_fatiga','condiciones_aptas'].forEach(campo => {
      if (typeof record[campo] !== 'boolean') {
        console.log(`Advertencia: Campo ${campo} no es booleano`);
      }
    });
    // Validar kilometraje (solo log, sin warning)
    const km = normalizeKilometraje(record.kilometraje);
    if (km === 0) {
      console.log('Advertencia: Kilometraje vacío o inválido');
    }
    // Validar turno (solo log, sin warning)
    if (!record.turno || !['DIURNA','NOCTURNA'].includes(record.turno.toUpperCase())) {
      console.log('Advertencia: Turno dudoso o vacío');
    }
    // Validar campos opcionales y otros
    // ...agregar validaciones adicionales según reglas de negocio
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
