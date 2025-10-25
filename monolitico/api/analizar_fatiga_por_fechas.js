const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANALIZANDO CAMPOS DE FATIGA POR FECHAS EN EL EXCEL...\n');

// Leer el Excel
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Total de registros en Excel: ${data.length}\n`);

// Función para convertir fecha de Excel
function parseExcelDate(excelDate) {
  if (!excelDate) return null;
  
  if (typeof excelDate === 'string') {
    // Formato MM/DD/YYYY H:MM:SS
    const d = new Date(excelDate);
    return isNaN(d.getTime()) ? null : d;
  }
  
  if (typeof excelDate === 'number') {
    // Número de Excel (días desde 1900-01-01)
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

// Analizar registros por fecha
const registrosConFecha = [];
const camposFatiga = [
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir?',
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
];

// Buscar variaciones de los nombres de los campos
const columnas = Object.keys(data[0]);
console.log('🔍 BUSCANDO CAMPOS DE FATIGA CON VARIACIONES:\n');

const camposEncontrados = {};
camposFatiga.forEach(campo => {
  console.log(`➡️ Buscando: "${campo}"`);
  
  // Buscar exacto
  let encontrado = columnas.find(col => col === campo);
  
  // Buscar variaciones
  if (!encontrado) {
    encontrado = columnas.find(col => {
      const colLower = col.toLowerCase().trim();
      const campoLower = campo.toLowerCase().trim();
      
      if (campo.includes('dormido')) return colLower.includes('dormido') || colLower.includes('horas');
      if (campo.includes('fatiga')) return colLower.includes('fatiga') || colLower.includes('síntomas');
      if (campo.includes('condiciones')) return colLower.includes('condiciones') && (colLower.includes('físicas') || colLower.includes('mentales'));
      if (campo.includes('medicamentos')) return colLower.includes('medicamentos') || colLower.includes('sustancias');
      
      return false;
    });
  }
  
  if (encontrado) {
    console.log(`   ✅ ENCONTRADO: "${encontrado}"`);
    camposEncontrados[campo] = encontrado;
  } else {
    console.log(`   ❌ NO ENCONTRADO`);
  }
});

console.log(`\n📊 Campos de fatiga encontrados: ${Object.keys(camposEncontrados).length}/4\n`);

// Analizar datos por fecha
data.forEach((row, idx) => {
  const marcaTemporal = row['Marca temporal'];
  const fecha = parseExcelDate(marcaTemporal);
  
  if (fecha) {
    const registro = {
      indice: idx,
      fecha: fecha,
      fechaStr: fecha.toLocaleDateString() + ' ' + fecha.toLocaleTimeString(),
      fatiga: {}
    };
    
    // Revisar cada campo de fatiga
    Object.keys(camposEncontrados).forEach(campoOriginal => {
      const columnaExcel = camposEncontrados[campoOriginal];
      const valor = row[columnaExcel];
      registro.fatiga[campoOriginal] = {
        valor: valor,
        existe: valor !== undefined && valor !== null && valor !== ''
      };
    });
    
    registrosConFecha.push(registro);
  }
});

// Ordenar por fecha
registrosConFecha.sort((a, b) => a.fecha - b.fecha);

console.log('🔍 ANÁLISIS POR RANGO DE FECHAS:\n');

// Fecha límite: 15 de julio de 2025
const fechaLimite = new Date('2025-07-15');
const registrosAntes = registrosConFecha.filter(r => r.fecha < fechaLimite);
const registrosDespues = registrosConFecha.filter(r => r.fecha >= fechaLimite);

console.log(`📅 ANTES del 15 de julio de 2025: ${registrosAntes.length} registros`);
console.log(`📅 DESDE el 15 de julio de 2025: ${registrosDespues.length} registros\n`);

// Analizar registros ANTES del 15 de julio
if (registrosAntes.length > 0) {
  console.log('📊 REGISTROS ANTES DEL 15 DE JULIO (primeros 5):');
  registrosAntes.slice(0, 5).forEach((reg, idx) => {
    console.log(`${idx + 1}. ${reg.fechaStr}`);
    Object.keys(reg.fatiga).forEach(campo => {
      const info = reg.fatiga[campo];
      console.log(`   ${info.existe ? '✅' : '❌'} ${campo.substring(0, 30)}...: "${info.valor}"`);
    });
    console.log('');
  });
}

// Analizar registros DESPUÉS del 15 de julio
if (registrosDespues.length > 0) {
  console.log('📊 REGISTROS DESDE EL 15 DE JULIO (primeros 5):');
  registrosDespues.slice(0, 5).forEach((reg, idx) => {
    console.log(`${idx + 1}. ${reg.fechaStr}`);
    Object.keys(reg.fatiga).forEach(campo => {
      const info = reg.fatiga[campo];
      console.log(`   ${info.existe ? '✅' : '❌'} ${campo.substring(0, 30)}...: "${info.valor}"`);
    });
    console.log('');
  });
}

console.log('💡 CONCLUSIÓN:');
if (Object.keys(camposEncontrados).length > 0) {
  console.log('✅ Los campos de fatiga SÍ existen en el Excel.');
  console.log('🔧 El problema puede ser que:');
  console.log('   1. Los nombres exactos no coinciden con los del backend');
  console.log('   2. Los registros antiguos no tienen estos campos');
  console.log('   3. Necesitamos lógica condicional por fecha en mapRecordPesado()');
} else {
  console.log('❌ Los campos de fatiga no se encontraron con las variaciones buscadas.');
  console.log('🔍 Necesitamos ver los nombres EXACTOS de las columnas del Excel.');
}