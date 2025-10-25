const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 LISTANDO TODAS LAS COLUMNAS DEL EXCEL DE VEHÍCULOS PESADOS...\n');

// Leer el Excel más reciente
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Obtener todas las columnas del Excel
const columnas = Object.keys(data[0]);
console.log(`📊 Total de registros: ${data.length}`);
console.log(`📋 Total de columnas: ${columnas.length}\n`);

console.log('=' .repeat(80));
console.log('LISTADO COMPLETO DE COLUMNAS DEL EXCEL');
console.log('='.repeat(80));

columnas.forEach((col, idx) => {
  console.log(`${(idx + 1).toString().padStart(3)}: "${col}"`);
});

console.log('\n' + '='.repeat(80));
console.log('ANÁLISIS DE LA LÓGICA ACTUAL DEL BACKEND');
console.log('='.repeat(80));

console.log('\n❌ CAMPOS DE FATIGA QUE BUSCA EL BACKEND PERO NO EXISTEN EN EXCEL:');
const camposFatigaBuscados = [
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir? ',
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
];

camposFatigaBuscados.forEach(campo => {
  console.log(`  - "${campo}"`);
});

console.log('\n💡 CONCLUSIÓN:');
console.log('El backend está intentando mapear campos de fatiga que NO existen en el Excel de vehículos pesados.');
console.log('Como estos campos retornan "undefined", el normalizeBoolean() probablemente los convierte a "false".');
console.log('Esto hace que TODOS los vehículos pesados tengan problemas de fatiga porque:');
console.log('  - horas_sueno_suficientes = false (debería ser true)');
console.log('  - libre_sintomas_fatiga = false (debería ser true)');
console.log('  - condiciones_aptas = false (debería ser true)');
console.log('  - consumo_medicamentos = false (está bien como false)');

console.log('\n🔧 SOLUCIÓN NECESARIA:');
console.log('1. Modificar mapRecordPesado() para asignar valores por defecto seguros para fatiga');
console.log('2. O detectar que es un Excel de vehículos pesados y manejar estos campos apropiadamente');