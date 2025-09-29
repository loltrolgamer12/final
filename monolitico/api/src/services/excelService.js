const XLSX = require('xlsx');
const crypto = require('crypto');
const prisma = require('../config/database');
const validationService = require('./validationService');
const excelParser = require('../utils/excelParser');

module.exports = {
  async processExcelFile(buffer, filename, options = {}) {
    try {
      const jsonData = excelParser.parseExcel(buffer);
      const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
      const mappedRecords = jsonData.map(row => this.mapRecord(row));
      const validRecords = [];
      const duplicates = [];
      const errors = [];

      // Validar y detectar duplicados (optimizado en bloque)
      for (const record of mappedRecords) {
        const validation = validationService.validateRecord(record);
        if (!validation.isValid) {
          errors.push({ record, errors: validation.errors });
          continue;
        }
        validRecords.push(record);
      }

      // Buscar duplicados en bloque
      if (validRecords.length > 0) {
        const orConditions = validRecords.map(r => ({
          placa_vehiculo: r.placa_vehiculo,
          fecha: new Date(r.fecha),
          conductor_nombre: r.conductor_nombre
        }));
        // Prisma limita el tamaño de OR, así que dividir en lotes de 500
        const chunkSize = 500;
        let foundDuplicates = [];
        for (let i = 0; i < orConditions.length; i += chunkSize) {
          const chunk = orConditions.slice(i, i + chunkSize);
          const chunkDuplicates = await prisma.inspeccion.findMany({ where: { OR: chunk }, select: { id: true, placa_vehiculo: true, fecha: true, conductor_nombre: true } });
          foundDuplicates = foundDuplicates.concat(chunkDuplicates);
        }
        // Filtrar los duplicados
        const isDuplicate = (rec) => foundDuplicates.some(d => d.placa_vehiculo === rec.placa_vehiculo && new Date(d.fecha).toISOString() === new Date(rec.fecha).toISOString() && d.conductor_nombre === rec.conductor_nombre);
        const newValidRecords = [];
        for (const rec of validRecords) {
          if (isDuplicate(rec)) {
            duplicates.push(rec);
          } else {
            newValidRecords.push(rec);
          }
        }
        validRecords.length = 0;
        validRecords.push(...newValidRecords);
      }

      // Procesar por lotes e insertar en BD (batchSize reducido a 100)
      const batchSize = options.batchSize || 100;
      const batches = this.splitIntoBatches(validRecords, batchSize);
      let insertados = 0;
      for (const batch of batches) {
        try {
          const result = await prisma.inspeccion.createMany({ data: batch });
          insertados += batch.length;
        } catch (error) {
          console.error('Error al insertar batch:', error);
        }
      }

      // Registrar archivo procesado evitando duplicidad de hash_archivo
      const archivoExistente = await prisma.archivoProcesado.findUnique({
        where: { hash_archivo: fileHash }
      });
      if (!archivoExistente) {
        await prisma.archivoProcesado.create({
          data: {
            nombre_archivo: filename,
            hash_archivo: fileHash,
            tamano_archivo: buffer.length,
            total_registros: mappedRecords.length,
            registros_insertados: insertados,
            registros_duplicados: duplicates.length,
            registros_error: errors.length,
            tiempo_procesamiento: 0, // Se puede calcular con Date.now()
            errores_validacion: errors,
            advertencias: [],
            fecha_procesamiento: new Date(),
            usuario_carga: 'admin' // Se puede obtener del contexto
          }
        });
      } else {
        console.log('Este archivo Excel ya fue procesado anteriormente.');
        return {
          success: false,
          error: 'Este archivo Excel ya fue procesado anteriormente. Si necesitas volver a cargarlo, modifica el archivo o usa uno diferente.'
        };
      }

      return {
        success: true,
        totalRecords: mappedRecords.length,
        validRecords: validRecords.length,
        duplicates: duplicates.length,
        errors: errors.length,
        fileHash,
        insertados
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  mapRecord(row) {
    const validationService = require('./validationService');
    // Mapear y normalizar columnas del Excel a campos del modelo
    // Adaptación: aceptar nombres alternativos y normalizar fecha
    function getConductorNombre(row) {
      // Buscar la columna ignorando espacios y mayúsculas/minúsculas
      const keys = Object.keys(row);
      const target = 'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN';
      let foundKey = keys.find(k => k.trim().toUpperCase() === target.trim().toUpperCase());
      return (foundKey && row[foundKey]) ? row[foundKey] : (row['nombre_conductor'] || '');
    }
    function normalizeToISO(raw) {
      if (!raw) return null;
      // Si ya es ISO, retorna igual
      if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) return raw;
      // Si es MM/DD/YY o MM/DD/YYYY HH:mm:ss
      let d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString();
      // Si es solo fecha tipo MM/DD/YY
      const parts = raw.split(' ');
      let datePart = parts[0];
      let [month, day, year] = datePart.split(/[\/]/);
      if (year && month && day) {
        // Si el año es corto, asume 20xx
        if (year.length === 2) year = '20' + year;
        let d2 = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`);
        if (!isNaN(d2.getTime())) return d2.toISOString();
      }
      return null;
    }
    return {
      marca_temporal: normalizeToISO(row['Marca temporal'] || row['fecha'] || ''),
      conductor_nombre: getConductorNombre(row),
      fecha: normalizeToISO(row['fecha'] || row['Marca temporal'] || ''),
      contrato: row['CONTRATO'],
      campo_coordinacion: row['CAMPO/COORDINACIÓN'],
      placa_vehiculo: row['PLACA DEL VEHICULO'] ? String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '',
      kilometraje: validationService.normalizeKilometraje(row['KILOMETRAJE']),
      turno: row['TURNO'] ? row['TURNO'].toUpperCase().trim() : '',
      altas_bajas: validationService.normalizeBoolean(row['** ALTAS Y BAJAS']),
      direccionales: validationService.normalizeBoolean(row['DIRECCIONALES DERECHA E IZQUIERDA']),
      parqueo: validationService.normalizeBoolean(row['**DE PARQUEO']),
      freno: validationService.normalizeBoolean(row['**DE FRENO']),
      reversa: validationService.normalizeBoolean(row['**DE REVERSA Y ALARMA DE RETROCESO']),
      espejos: validationService.normalizeBoolean(row['**ESPEJO CENTRAL Y ESPEJOS LATERALES']),
      vidrio_frontal: validationService.normalizeBoolean(row['**VIDRIO FRONTAL']),
      frenos: validationService.normalizeBoolean(row['**FRENOS']),
      frenos_emergencia: validationService.normalizeBoolean(row['**FRENOS DE EMERGENCIA O DE MANO']),
      cinturones: validationService.normalizeBoolean(row['**CINTURONES DE SEGURIDAD']),
      puertas: validationService.normalizeBoolean(row['PUERTAS EN BUEN ESTADO']),
      vidrios: validationService.normalizeBoolean(row['VIDRIOS EN BUEN ESTADO']),
      limpiaparabrisas: validationService.normalizeBoolean(row['**LIMPIA BRISAS']),
      observaciones: row['OBSERVACIONES'] || '',
      horas_sueno_suficientes: validationService.normalizeBoolean(row['¿Ha dormido al menos 7 horas en las últimas 24 horas?']),
      libre_sintomas_fatiga: validationService.normalizeBoolean(row['¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?']),
      condiciones_aptas: validationService.normalizeBoolean(row['¿Se siente en condiciones físicas y mentales para conducir?']),
      consumo_medicamentos: validationService.normalizeBoolean(row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*']),
      nivel_riesgo: this.calcularRiesgo(row),
      puntaje_total: this.calcularPuntaje(row),
      puntaje_fatiga: this.calcularPuntajeFatiga(row),
      tiene_alertas_criticas: this.tieneAlertasCriticas(row)
    };
  },
  splitIntoBatches(records, batchSize) {
    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    return batches;
  },
  calcularRiesgo(row) {
    // Ejemplo de lógica: si falta sueño, síntomas de fatiga o medicamentos, riesgo ALTO
    if (row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*'] === 'Sí' ||
        row['¿Ha dormido al menos 7 horas en las últimas 24 horas?'] !== 'Cumple' ||
        row['¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?'] !== 'Cumple') {
      return 'ALTO';
    }
    if (row['¿Se siente en condiciones físicas y mentales para conducir?'] !== 'Cumple') {
      return 'MEDIO';
    }
    return 'BAJO';
  },
  calcularPuntaje(row) {
    // Ejemplo: sumar 1 por cada campo "CUMPLE" en inspección mecánica
    let puntaje = 0;
    const campos = [
      '** ALTAS Y BAJAS','DIRECCIONALES DERECHA E IZQUIERDA','**DE PARQUEO','**DE FRENO','**DE REVERSA Y ALARMA DE RETROCESO','**ESPEJO CENTRAL Y ESPEJOS LATERALES','**VIDRIO FRONTAL','**FRENOS','**FRENOS DE EMERGENCIA O DE MANO','**CINTURONES DE SEGURIDAD','PUERTAS EN BUEN ESTADO','VIDRIOS EN BUEN ESTADO','**LIMPIA BRISAS'
    ];
    campos.forEach(campo => {
      if (row[campo] === 'CUMPLE') puntaje++;
    });
    return puntaje;
  },
  calcularPuntajeFatiga(row) {
    // Ejemplo: sumar 1 por cada respuesta positiva en fatiga
    let puntaje = 0;
    if (row['¿Ha dormido al menos 7 horas en las últimas 24 horas?'] === 'Cumple') puntaje++;
    if (row['¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?'] === 'Cumple') puntaje++;
    if (row['¿Se siente en condiciones físicas y mentales para conducir?'] === 'Cumple') puntaje++;
    if (row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*'] !== 'Sí') puntaje++;
    return puntaje;
  },
  tieneAlertasCriticas(row) {
    // Ejemplo: si riesgo es ALTO o puntaje fatiga < 2
    const riesgo = this.calcularRiesgo(row);
    const puntajeFatiga = this.calcularPuntajeFatiga(row);
    return riesgo === 'ALTO' || puntajeFatiga < 2;
  }
};
