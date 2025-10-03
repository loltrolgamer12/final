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
      
      // Determinar tipo (ligero/pesado)
      const tipo = options.tipo || 'ligero';
      
      console.log(`📊 PROCESANDO EXCEL: ${filename}, tipo: ${tipo}, registros: ${jsonData.length}`);
      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const colNames = Object.keys(firstRow);
        console.log(`📋 Total columnas: ${colNames.length}`);
        console.log(`📋 Primeras 10 columnas:`, colNames.slice(0, 10));
      }
      
      // Mapear registros según tipo
      const mappedRecords = jsonData.map(row => 
        tipo === 'pesado' ? this.mapRecordPesado(row) : this.mapRecord(row)
      );
      
      const validRecords = [];
      const duplicates = [];
      const errors = [];
      let dbDuplicates = 0;
      const rechazados = [];

      // Validar y detectar duplicados (optimizado en bloque)
      for (const record of mappedRecords) {
        const validation = validationService.validateRecord(record, tipo);
        if (!validation.isValid) {
          errors.push({ record, errors: validation.errors });
          rechazados.push({ ...record, motivo_rechazo: validation.errors.map(e => e.message).join('; ') });
          continue;
        }
        validRecords.push(record);
      }

      // Buscar duplicados y guardar según tipo (ligero/pesado)
      const tablaInspeccion = tipo === 'pesado' ? prisma.inspeccionPesado : prisma.inspeccion;
      const tablaRechazo = tipo === 'pesado' ? prisma.rechazoInspeccionPesado : prisma.rechazoInspeccion;

      if (validRecords.length > 0) {
        // Construir condiciones de búsqueda según tipo
        const orConditions = validRecords.map(r => {
          if (tipo === 'pesado') {
            return {
              placa_vehiculo: r.placa_vehiculo,
              fecha: new Date(r.fecha),
              nombre_inspector: r.nombre_inspector
            };
          } else {
            return {
              placa_vehiculo: r.placa_vehiculo,
              fecha: new Date(r.fecha),
              conductor_nombre: r.conductor_nombre
            };
          }
        });
        
        // Prisma limita el tamaño de OR, así que dividir en lotes de 500
        const chunkSize = 500;
        let foundDuplicates = [];
        for (let i = 0; i < orConditions.length; i += chunkSize) {
          const chunk = orConditions.slice(i, i + chunkSize);
          const selectFields = tipo === 'pesado' 
            ? { id: true, placa_vehiculo: true, fecha: true, nombre_inspector: true }
            : { id: true, placa_vehiculo: true, fecha: true, conductor_nombre: true };
          const chunkDuplicates = await tablaInspeccion.findMany({ 
            where: { OR: chunk }, 
            select: selectFields 
          });
          foundDuplicates = foundDuplicates.concat(chunkDuplicates);
        }
        
        // Filtrar los duplicados según tipo
        const isDuplicate = (rec) => {
          if (tipo === 'pesado') {
            return foundDuplicates.some(d => 
              d.placa_vehiculo === rec.placa_vehiculo && 
              new Date(d.fecha).toISOString() === new Date(rec.fecha).toISOString() && 
              d.nombre_inspector === rec.nombre_inspector
            );
          } else {
            return foundDuplicates.some(d => 
              d.placa_vehiculo === rec.placa_vehiculo && 
              new Date(d.fecha).toISOString() === new Date(rec.fecha).toISOString() && 
              d.conductor_nombre === rec.conductor_nombre
            );
          }
        };
        
        const newValidRecords = [];
        for (const rec of validRecords) {
          if (isDuplicate(rec)) {
            duplicates.push(rec);
            rechazados.push({ ...rec, motivo_rechazo: 'Duplicado en base de datos' });
          } else {
            newValidRecords.push(rec);
          }
        }
        validRecords.length = 0;
        validRecords.push(...newValidRecords);
      }

      // Procesar por lotes e insertar en la tabla correspondiente
      const batchSize = options.batchSize || 100;
      const batches = this.splitIntoBatches(validRecords, batchSize);
      let insertados = 0;
      for (const batch of batches) {
        try {
          const result = await tablaInspeccion.createMany({ data: batch, skipDuplicates: true });
          insertados += result.count;
          dbDuplicates += (batch.length - result.count);
        } catch (error) {
          if (error.code === 'P2002') {
            dbDuplicates += batch.length;
            batch.forEach(rec => rechazados.push({ ...rec, motivo_rechazo: 'Duplicado en base de datos (restricción única)' }));
          } else {
            console.error('Error al insertar batch:', error);
          }
        }
      }

      // Guardar todos los rechazados en la tabla correspondiente
      if (rechazados.length > 0) {
        const batchSizeRechazo = 100;
        for (let i = 0; i < rechazados.length; i += batchSizeRechazo) {
          const batch = rechazados.slice(i, i + batchSizeRechazo);
          await tablaRechazo.createMany({ data: batch });
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
            registros_duplicados: duplicates.length + dbDuplicates,
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
        duplicates: duplicates.length + dbDuplicates,
        errors: errors.length,
        fileHash,
        insertados,
        rechazados: rechazados.length
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
  mapRecordPesado(row) {
    // Helper para obtener valor de columna directamente (sin normalización extra)
    function getCol(columnName) {
      // Busca la columna tal cual en el row
      if (row.hasOwnProperty(columnName)) {
        const val = row[columnName];
        return (val !== undefined && val !== null) ? String(val).trim() : '';
      }
      return '';
    }
    
    // Función para convertir número de Excel (serial date) a fecha ISO
    function excelDateToISO(excelDate) {
      if (!excelDate) return null;
      
      // Si ya es una cadena con formato ISO o fecha, intentar parsearla
      if (typeof excelDate === 'string') {
        const d = new Date(excelDate);
        if (!isNaN(d.getTime())) return d.toISOString();
        return null;
      }
      
      // Si es un número (formato de Excel: días desde 1900-01-01)
      if (typeof excelDate === 'number') {
        // Excel fecha base: 1900-01-01 (pero Excel cuenta desde 1900-01-00, bug histórico)
        const excelEpoch = new Date(1899, 11, 30); // 30 dic 1899
        const msPerDay = 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
        if (!isNaN(date.getTime())) return date.toISOString();
      }
      
      return null;
    }
    
    const marcaTemporal = row['Marca temporal'];
    const nombreInspector = getCol('NOMBRE DE QUIEN REALIZA LA INSPECCIÓN');
    const placa = getCol('PLACA DEL VEHICULO');
    
    return {
      marca_temporal: excelDateToISO(marcaTemporal),
      nombre_inspector: nombreInspector,
      fecha: excelDateToISO(marcaTemporal),
      contrato: getCol('CONTRATO'),
      campo_coordinacion: getCol('CAMPO/COORDINACIÓN'),
      placa_vehiculo: placa ? placa.replace(/\s+/g, '').toUpperCase() : '',
      kilometraje: validationService.normalizeKilometraje(row['KILOMETRAJE']),
      turno: getCol('TURNO').toUpperCase(),
      altas_bajas: validationService.normalizeBoolean(row['**Altas y bajas']),
      direccionales: validationService.normalizeBoolean(row['**Direccionales derecha e izquierda']),
      parqueo: validationService.normalizeBoolean(row['**De parqueo']),
      freno: validationService.normalizeBoolean(row['**De freno']),
      reversa_alarma: validationService.normalizeBoolean(row['**De reversa y alarma de retroceso']),
      espejos: validationService.normalizeBoolean(row['**Espejo central y espejos laterales']),
      vidrio_frontal: validationService.normalizeBoolean(row['**Vidrio frontal']),
      presentacion_aseo: validationService.normalizeBoolean(row['Presentación de orden y aseo']),
      pito: validationService.normalizeBoolean(row['Pito']),
      gps: validationService.normalizeBoolean(row['Sistema de monitoreo GPS']),
      cinturones: validationService.normalizeBoolean(row['**Cinturones de seguridad']),
      puertas: validationService.normalizeBoolean(row['Puertas en buen estado']),
      vidrios: validationService.normalizeBoolean(row['Vidrios en buen estado']),
      limpiaparabrisas: validationService.normalizeBoolean(row['Limpia brisas']),
      extintor: validationService.normalizeBoolean(row['Exintor vigente']),
      botiquin: validationService.normalizeBoolean(row['Botiquín']),
      tapiceria: validationService.normalizeBoolean(row['Estado general de tapicería']),
      indicadores: validationService.normalizeBoolean(row['Indicadores (nivel de combustible, temperatura, velocímetro y aceite)']),
      objetos_sueltos: validationService.normalizeBoolean(row['**Verificar la ausencia de objetos sueltos en la cabina que puedan distraer al conductor']),
      frenos: validationService.normalizeBoolean(row['**Frenos']),
      frenos_emergencia: validationService.normalizeBoolean(row['**Freno de emergencia o de mano']),
      fugas_aire: validationService.normalizeBoolean(row['**Fugas de aire (movil 100)']),
      control_fugas_aire: validationService.normalizeBoolean(row['**Control fugas de aire (movil 100)']),
      candados_bandas: validationService.normalizeBoolean(row['**Candados y Bandas (movil 100)']),
      acoples_tomas: validationService.normalizeBoolean(row['**Acoples para tomas eléctricas y de aire (movil 100)']),
      nivel_aceite_motor: validationService.normalizeBoolean(row['**Niveles de fluidos aceite motor']),
      nivel_fluido_frenos: validationService.normalizeBoolean(row['**Nivel de fluido de frenos']),
      nivel_fluido_dir_hidraulica: validationService.normalizeBoolean(row['**Nivel de fluido de dirección hidraúlica']),
      nivel_fluido_refrigerante: validationService.normalizeBoolean(row['**Nivel de fluido refrigerante']),
      nivel_fluido_limpia_parabrisas: validationService.normalizeBoolean(row['Nivel de fluido limpia parabrisas']),
      correas: validationService.normalizeBoolean(row['Estado de correas']),
      baterias: validationService.normalizeBoolean(row['Estado de baterías, cables, conexiones']),
      llantas_labrado: validationService.normalizeBoolean(row['**Llantas - Labrado (min 3mm de labrado) ']),
      llantas_sin_cortes: validationService.normalizeBoolean(row['**Llantas - Sin cortaduras y sin abultamientos']),
      llanta_repuesto: validationService.normalizeBoolean(row['Llanta de repuesto']),
      copas_pernos: validationService.normalizeBoolean(row['**Copas o pernos de sujeción de las llantas']),
      suspension: validationService.normalizeBoolean(row['**Suspensión (terminales)']),
      direccion: validationService.normalizeBoolean(row['**Dirección (terminales)']),
      tapa_tanque: validationService.normalizeBoolean(row['Tapa de tanque de combustible en buen estado']),
      equipo_carretera: validationService.normalizeBoolean(row['Equipo de carretera: gato, llave de pernos, herramienta básica, triángulos o conos, bloques, chaleco, señal pare-siga']),
      kit_ambiental: validationService.normalizeBoolean(row['Kit ambiental']),
      documentacion: validationService.normalizeBoolean(row['Documentación: tecnomecánica y de gases, tarjeta de propiedad, SOAT, licencia de conducción y permiso para conducir interno']),
      observaciones: getCol('OBSERVACIONES'),
      horas_sueno_suficientes: validationService.normalizeBoolean(row['¿Ha dormido al menos 7 horas en las últimas 24 horas?']),
      libre_sintomas_fatiga: validationService.normalizeBoolean(row['¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?']),
      condiciones_aptas: validationService.normalizeBoolean(row['¿Se siente en condiciones físicas y mentales para conducir? ']),
      consumo_medicamentos: validationService.normalizeBoolean(row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?']),
      nivel_riesgo: 'BAJO', // Calculado después
      puntaje_total: 0,     // Calculado después
      puntaje_fatiga: 0,    // Calculado después
      tiene_alertas_criticas: false // Calculado después
    };
  },
  splitIntoBatches(records, batchSize) {
    const batches = [];
    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }
    return batches;
  },
  calcularRiesgoVehiculo(row) {
    // RIESGO DEL VEHÍCULO: Solo componentes mecánicos
    const componentesCriticos = [
      row['**FRENOS'],                    // Frenos principales
      row['**FRENOS DE EMERGENCIA O DE MANO'], // Freno de emergencia
      row['**CINTURONES DE SEGURIDAD'],   // Cinturones
      row['**DE FRENO']                   // Luces de freno
    ];
    
    const componentesSemiCriticos = [
      row['DIRECCIONALES DERECHA E IZQUIERDA'], // Direccionales
      row['**ESPEJO CENTRAL Y ESPEJOS LATERALES'], // Espejos
      row['**VIDRIO FRONTAL'],            // Vidrio frontal
      row['**DE REVERSA Y ALARMA DE RETROCESO'], // Reversa/alarma
      row['** ALTAS Y BAJAS']             // Luces altas/bajas
    ];
    
    const fallasCriticas = componentesCriticos.filter(c => c === false || c === 'NO CUMPLE').length;
    const fallasSemiCriticas = componentesSemiCriticos.filter(c => c === false || c === 'NO CUMPLE').length;
    
    if (fallasCriticas > 0) return 'ALTO';
    if (fallasSemiCriticas >= 2) return 'MEDIO';
    return 'BAJO';
  },
  
  calcularRiesgoConductor(row) {
    // RIESGO DEL CONDUCTOR: Solo condiciones del conductor
    if (row.consumo_medicamentos === true) return 'ALTO';           // Medicamentos
    if (row.horas_sueno_suficientes === false) return 'ALTO';       // Sin sueño
    if (row.libre_sintomas_fatiga === false) return 'ALTO';         // Con fatiga
    return 'BAJO';
  },
  
  calcularRiesgo(row) {
    // RIESGO GENERAL: El más alto entre vehículo y conductor
    const riesgoVehiculo = this.calcularRiesgoVehiculo(row);
    const riesgoConductor = this.calcularRiesgoConductor(row);
    
    // Prioridad: ALTO > MEDIO > BAJO
    if (riesgoVehiculo === 'ALTO' || riesgoConductor === 'ALTO') return 'ALTO';
    if (riesgoVehiculo === 'MEDIO' || riesgoConductor === 'MEDIO') return 'MEDIO';
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
    // Sumar 1 por cada respuesta positiva en fatiga usando booleanos
    let puntaje = 0;
    if (row.horas_sueno_suficientes === true) puntaje++;
    if (row.libre_sintomas_fatiga === true) puntaje++;
    if (row.condiciones_aptas === true) puntaje++;
    if (row.consumo_medicamentos !== true) puntaje++;
    return puntaje;
  },
  tieneAlertasCriticas(row) {
    // Ejemplo: si riesgo es ALTO o puntaje fatiga < 2
    const riesgo = this.calcularRiesgo(row);
    const puntajeFatiga = this.calcularPuntajeFatiga(row);
    return riesgo === 'ALTO' || puntajeFatiga < 2;
  }
};
