require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

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

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  if (v === "") return false;
  return false;
}

function calcularPuntajeFatiga(data) {
  let puntaje = 0;
  if (!normalizeBoolean(data.horas_sueno_suficientes)) puntaje += 5;
  if (!normalizeBoolean(data.libre_sintomas_fatiga)) puntaje += 3;
  if (!normalizeBoolean(data.condiciones_aptas)) puntaje += 4;
  if (normalizeBoolean(data.consumo_medicamentos)) puntaje += 2;
  return puntaje;
}

function calcularPuntajeTotal(data) {
  const campos = [
    'altas_bajas', 'direccionales', 'parqueo', 'freno', 'reversa_alarma',
    'espejos', 'vidrio_frontal', 'presentacion_aseo', 'pito', 'gps',
    'cinturones', 'puertas', 'vidrios', 'limpiaparabrisas', 'extintor',
    'botiquin', 'tapiceria', 'indicadores', 'objetos_sueltos', 'frenos',
    'frenos_emergencia', 'fugas_aire', 'control_fugas_aire', 'candados_bandas',
    'acoples_tomas', 'nivel_aceite_motor', 'nivel_fluido_frenos',
    'nivel_fluido_dir_hidraulica', 'nivel_fluido_refrigerante',
    'nivel_fluido_limpia_parabrisas', 'correas', 'baterias', 'llantas_labrado',
    'llantas_sin_cortes', 'llanta_repuesto', 'copas_pernos', 'suspension',
    'direccion', 'tapa_tanque', 'equipo_carretera', 'kit_ambiental', 'documentacion'
  ];
  
  let puntaje = 0;
  campos.forEach(campo => {
    if (!normalizeBoolean(data[campo])) puntaje += 1;
  });
  
  return puntaje;
}

function determinarNivelRiesgo(puntajeTotal, puntajeFatiga) {
  if (puntajeTotal >= 10 || puntajeFatiga >= 8) return 'ALTO';
  if (puntajeTotal >= 5 || puntajeFatiga >= 5) return 'MEDIO';
  return 'BAJO';
}

async function importarDatosNuevos() {
  console.log('📥 IMPORTANDO DATOS NUEVOS DEL EXCEL A LA BASE DE DATOS\n');
  
  // 1. Leer el Excel
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total de registros en Excel: ${data.length}\n`);
  
  // 2. Procesar cada fila e importar a la BD
  console.log('🔄 Procesando e importando registros...\n');
  
  let importados = 0;
  let duplicados = 0;
  let errores = 0;
  
  // Detectar automáticamente la columna correcta al inicio
  const primeraFila = data[0] || {};
  const columnas = Object.keys(primeraFila);
  const labradoColumnName = columnas.find(col => 
    col.includes('Llantas') && col.includes('Labrado') && col.includes('min 3mm')
  );
  
  if (!labradoColumnName) {
    console.log('❌ Error: No se encontró la columna de labrado en el Excel');
    return;
  }
  
  console.log(`✅ Columna de labrado detectada: "${labradoColumnName}"`);
  console.log(`   Longitud: ${labradoColumnName.length} caracteres\n`);
  
  for (const row of data) {
    try {
      const placa = row['PLACA DEL VEHICULO'] ? 
        String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const nombreInspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      const marcaTemporal = row['Marca temporal'];
      
      if (!placa || !marcaTemporal || !nombreInspector) {
        console.log(`  ⚠️ Datos incompletos: placa="${placa}", inspector="${nombreInspector}", fecha="${marcaTemporal}"`);
        continue;
      }
      
      // Convertir fecha Excel a ISO
      const fecha = excelDateToISO(marcaTemporal);
      if (!fecha) {
        console.log(`  ⚠️ Fecha inválida: ${marcaTemporal}`);
        continue;
      }
      
      const fechaObj = new Date(fecha);
      
      // Verificar si ya existe
      const existeRegistro = await prisma.inspeccionPesado.findFirst({
        where: {
          placa_vehiculo: placa,
          marca_temporal: fechaObj,
          nombre_inspector: nombreInspector
        }
      });
      
      if (existeRegistro) {
        duplicados++;
        continue;
      }
      
      // Mapear todos los campos del Excel
      const registro = {
        marca_temporal: fechaObj,
        nombre_inspector: nombreInspector,
        contrato: String(row['Contrato'] || '').trim(),
        campo_coordinacion: String(row['Campo de coordinación'] || '').trim(),
        placa_vehiculo: placa,
        kilometraje: parseInt(row['Kilometraje del vehículo'] || '0') || 0,
        turno: String(row['Turno'] || '').trim(),
        
        // Campos booleanos con normalización
        altas_bajas: normalizeBoolean(row['Luces - Altas y Bajas']),
        direccionales: normalizeBoolean(row['Luces - Direccionales']),
        parqueo: normalizeBoolean(row['Luces - Parqueo']),
        freno: normalizeBoolean(row['Luces - Freno']),
        reversa_alarma: normalizeBoolean(row['Luces - Reversa y Alarma audible']),
        espejos: normalizeBoolean(row['Espejos']),
        vidrio_frontal: normalizeBoolean(row['Vidrio Frontal']),
        presentacion_aseo: normalizeBoolean(row['Presentación y Aseo']),
        pito: normalizeBoolean(row['Pito']),
        gps: normalizeBoolean(row['GPS']),
        cinturones: normalizeBoolean(row['Cinturones de seguridad']),
        puertas: normalizeBoolean(row['Puertas']),
        vidrios: normalizeBoolean(row['Vidrios']),
        limpiaparabrisas: normalizeBoolean(row['Limpiaparabrisas']),
        extintor: normalizeBoolean(row['Extintor']),
        botiquin: normalizeBoolean(row['Botiquín']),
        tapiceria: normalizeBoolean(row['Tapicería']),
        indicadores: normalizeBoolean(row['Indicadores']),
        objetos_sueltos: normalizeBoolean(row['Objetos sueltos']),
        frenos: normalizeBoolean(row['**Frenos de Servicio']),
        frenos_emergencia: normalizeBoolean(row['**Frenos de emergencia/parqueo']),
        fugas_aire: normalizeBoolean(row['**Fugas de aire']),
        control_fugas_aire: normalizeBoolean(row['**Control de fugas de aire']),
        candados_bandas: normalizeBoolean(row['**Candados y bandas']),
        acoples_tomas: normalizeBoolean(row['**Acoples y tomas']),
        nivel_aceite_motor: normalizeBoolean(row['Nivel de aceite del motor']),
        nivel_fluido_frenos: normalizeBoolean(row['Nivel de fluido de frenos']),
        nivel_fluido_dir_hidraulica: normalizeBoolean(row['Nivel de fluido de dirección hidráulica']),
        nivel_fluido_refrigerante: normalizeBoolean(row['Nivel de fluido refrigerante']),
        nivel_fluido_limpia_parabrisas: normalizeBoolean(row['Nivel de fluido limpiaparabrisas']),
        correas: normalizeBoolean(row['Correas']),
        baterias: normalizeBoolean(row['Baterías']),
        
        // CAMPO PRINCIPAL: Labrado de llantas con el nombre correcto
        llantas_labrado: normalizeBoolean(row[labradoColumnName]),
        
        llantas_sin_cortes: normalizeBoolean(row['**Llantas - Sin cortaduras y sin abultamientos']),
        llanta_repuesto: normalizeBoolean(row['Llanta de repuesto']),
        copas_pernos: normalizeBoolean(row['**Copas o pernos de sujeción de las llantas']),
        suspension: normalizeBoolean(row['**Suspensión']),
        direccion: normalizeBoolean(row['**Dirección']),
        tapa_tanque: normalizeBoolean(row['Tapa de tanque de combustible']),
        equipo_carretera: normalizeBoolean(row['Equipo de carretera']),
        kit_ambiental: normalizeBoolean(row['Kit ambiental']),
        documentacion: normalizeBoolean(row['Documentación']),
        
        observaciones: String(row['Observaciones'] || '').trim() || null,
        
        // Campos de fatiga
        horas_sueno_suficientes: normalizeBoolean(row['¿Durmió las horas de sueño suficientes?']),
        libre_sintomas_fatiga: normalizeBoolean(row['¿Se encuentra libre de síntomas de fatiga?']),
        condiciones_aptas: normalizeBoolean(row['¿Se encuentra en condiciones aptas para conducir?']),
        consumo_medicamentos: normalizeBoolean(row['¿Ha consumido medicamentos?']),
        
        fecha: fechaObj
      };
      
      // Calcular puntajes y nivel de riesgo
      registro.puntaje_fatiga = calcularPuntajeFatiga(registro);
      registro.puntaje_total = calcularPuntajeTotal(registro);
      registro.nivel_riesgo = determinarNivelRiesgo(registro.puntaje_total, registro.puntaje_fatiga);
      registro.tiene_alertas_criticas = registro.nivel_riesgo === 'ALTO';
      
      // Insertar en la BD
      await prisma.inspeccionPesado.create({
        data: registro
      });
      
      importados++;
      
      if (importados <= 5) {
        console.log(`  ✓ ${placa} - ${nombreInspector} -> Labrado: ${registro.llantas_labrado} (${row[labradoColumnName]})`);
      }
      
    } catch (error) {
      errores++;
      if (errores <= 3) {
        console.log(`  ✗ Error importando registro: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(60));
  console.log(`Total registros del Excel: ${data.length}`);
  console.log(`✅ Importados correctamente: ${importados}`);
  console.log(`⚠️  Ya existían (duplicados): ${duplicados}`);
  console.log(`❌ Errores: ${errores}`);
  
  await prisma.$disconnect();
  console.log('\n✅ Importación completada!');
}

importarDatosNuevos().catch(console.error);