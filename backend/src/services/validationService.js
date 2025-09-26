const placaRegex = /^[A-Z]{2,4}\s?\d{2,5}$/i;
const fechaRegex = /^(\d{4}-\d{2}-\d{2}|\d{4}\/\d{2}\/\d{2}|\d{2}\/\d{2}\/\d{4})/;

function normalizeBoolean(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN",""].includes(v)) return false;
  return false;
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
  validateRecord(record) {
    const errors = [];
    const warnings = [];
      // Log de entrada de registro
      console.log('Validando registro:', JSON.stringify(record));
    // Validar placa
    if (!record.placa_vehiculo || !placaRegex.test(record.placa_vehiculo.trim())) {
      warnings.push({ field: 'placa_vehiculo', message: `Placa dudosa: ${record.placa_vehiculo}` });
    }
    // Validar conductor
    if (!record.conductor_nombre || record.conductor_nombre.trim().length < 3) {
      errors.push({ field: 'conductor_nombre', message: 'Nombre del conductor requerido (mínimo 3 caracteres)' });
    }
    // Validar fecha
    const fechaValida = normalizeFecha(record.fecha);
    if (!fechaValida) {
      errors.push({ field: 'fecha', message: 'Fecha de inspección requerida o formato inválido' });
    }
    // Validar campos críticos de fatiga
    ['consumo_medicamentos','horas_sueno_suficientes','libre_sintomas_fatiga','condiciones_aptas'].forEach(campo => {
      if (typeof record[campo] !== 'boolean') {
        warnings.push({ field: campo, message: `Campo crítico dudoso o vacío: ${campo}` });
      }
    });
    // Validar kilometraje
    const km = normalizeKilometraje(record.kilometraje);
    if (km === 0) {
      warnings.push({ field: 'kilometraje', message: 'Kilometraje vacío o inválido' });
    }
    // Validar turno
    if (!record.turno || !['DIURNA','NOCTURNA'].includes(record.turno.toUpperCase())) {
      warnings.push({ field: 'turno', message: 'Turno dudoso o vacío' });
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
