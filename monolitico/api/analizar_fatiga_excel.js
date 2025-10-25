const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANALIZANDO CAMPOS DE FATIGA EN EXCEL DE VEHÍCULOS PESADOS...\n');

// Leer el Excel más reciente
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Total de registros en Excel: ${data.length}\n`);

// Analizar campos de fatiga específicamente
const camposFatiga = [
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir? ',
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
];

console.log('🔍 BÚSQUEDA DE CAMPOS DE FATIGA EN EL EXCEL:\n');

// Obtener todas las columnas del Excel
const columnas = Object.keys(data[0]);
console.log(`Total de columnas: ${columnas.length}\n`);

// Buscar cada campo de fatiga
camposFatiga.forEach(campo => {
  console.log(`➡️ Buscando: "${campo}"`);
  
  // Buscar columna exacta
  const encontradoExacto = columnas.find(col => col === campo);
  if (encontradoExacto) {
    console.log(`   ✅ ENCONTRADO EXACTO: "${encontradoExacto}"`);
  } else {
    // Buscar similar (contains)
    const encontradoSimilar = columnas.find(col => col.includes(campo.substring(0, 20)) || campo.includes(col));
    if (encontradoSimilar) {
      console.log(`   ⚠️ ENCONTRADO SIMILAR: "${encontradoSimilar}"`);
    } else {
      console.log(`   ❌ NO ENCONTRADO`);
    }
  }
  console.log('');
});

// Mostrar todas las columnas que contienen palabras clave de fatiga
console.log('🔍 COLUMNAS QUE CONTIENEN PALABRAS CLAVE DE FATIGA:\n');
const palabrasClave = ['fatiga', 'sueño', 'dormido', 'medicamento', 'condiciones', 'físicas', 'mentales'];

palabrasClave.forEach(palabra => {
  console.log(`📝 Columnas con "${palabra}":`);
  const encontradas = columnas.filter(col => col.toLowerCase().includes(palabra.toLowerCase()));
  if (encontradas.length > 0) {
    encontradas.forEach(col => console.log(`   - "${col}"`));
  } else {
    console.log(`   ❌ Ninguna`);
  }
  console.log('');
});

console.log('🔍 PRIMERAS 5 FILAS DE DATOS (para validar valores):\n');
data.slice(0, 5).forEach((row, idx) => {
  console.log(`=== FILA ${idx + 1} ===`);
  camposFatiga.forEach(campo => {
    const valor = row[campo];
    console.log(`${campo}: "${valor}"`);
  });
  console.log('');
});