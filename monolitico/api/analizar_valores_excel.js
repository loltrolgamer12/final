require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANALIZANDO VALORES EXACTOS DEL EXCEL...\n');

// Leer el Excel
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Total de registros en Excel: ${data.length}`);

// Identificar la columna correcta
const columnas = Object.keys(data[0]);
const columnasLabrado = columnas.filter(col => 
  col.includes('Llantas') && col.includes('Labrado')
);

if (columnasLabrado.length === 0) {
  console.log('❌ No se encontró la columna de labrado');
  process.exit(1);
}

const nombreColumnaLabrado = columnasLabrado[0];
console.log(`✅ Columna de labrado: "${nombreColumnaLabrado}"`);
console.log(`   Longitud: ${nombreColumnaLabrado.length} caracteres\n`);

// Analizar todos los valores únicos
console.log('📋 ANÁLISIS COMPLETO DE VALORES:');
const valoresLabrado = data.map(row => row[nombreColumnaLabrado]);
const valoresUnicos = [...new Set(valoresLabrado)].filter(v => v !== undefined && v !== null);

console.log(`Total valores únicos: ${valoresUnicos.length}`);
valoresUnicos.forEach(valor => {
  const count = valoresLabrado.filter(v => v === valor).length;
  const porcentaje = ((count / data.length) * 100).toFixed(2);
  console.log(`  "${valor}": ${count} registros (${porcentaje}%)`);
});

// Verificar si hay valores undefined/null
const valoresVacios = valoresLabrado.filter(v => v === undefined || v === null || v === '').length;
if (valoresVacios > 0) {
  console.log(`⚠️  Valores vacíos/undefined: ${valoresVacios} registros`);
}

console.log('\n📋 MUESTRA DE 10 REGISTROS:');
data.slice(0, 10).forEach((row, i) => {
  const placa = row['PLACA DEL VEHICULO'];
  const inspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'];
  const labrado = row[nombreColumnaLabrado];
  console.log(`${i + 1}. ${placa} - ${inspector}: "${labrado}"`);
});

console.log('\n✅ Análisis completado!');