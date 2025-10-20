const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 VERIFICANDO COLUMNAS DEL EXCEL DE VEHÍCULOS PESADOS...\n');

const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS 1.xlsx');

const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Total de registros: ${data.length}\n`);

const columnas = Object.keys(data[0]);

console.log('=== TODAS LAS COLUMNAS RELACIONADAS CON LLANTAS ===\n');

const columnasLlantas = columnas.filter(col => 
  col.toLowerCase().includes('llanta') || 
  col.toLowerCase().includes('labrado')
);

columnasLlantas.forEach((col, idx) => {
  console.log(`${idx + 1}. "${col}"`);
  console.log(`   Longitud: ${col.length} caracteres`);
  
  // Mostrar caracteres invisibles
  const conEspacios = col.split('').map(c => c === ' ' ? '·' : c).join('');
  console.log(`   Con espacios visibles: "${conEspacios}"`);
  
  // Verificar si termina con espacio
  if (col.endsWith(' ')) {
    console.log(`   ⚠️  TERMINA CON ESPACIO`);
  }
  if (col.startsWith(' ')) {
    console.log(`   ⚠️  COMIENZA CON ESPACIO`);
  }
  
  // Mostrar valores de ejemplo
  const valores = data.slice(0, 5).map(r => r[col]);
  console.log(`   Primeros 5 valores: ${valores.join(', ')}`);
  console.log('');
});

console.log('\n=== VERIFICACIÓN DEL CÓDIGO ACTUAL ===\n');

const nombreEnCodigo = '**Llantas - Labrado (min 3mm de labrado)';
console.log(`Código usa (sin espacio final): "${nombreEnCodigo}"`);

const existeSinEspacio = columnas.includes(nombreEnCodigo);
const existeConEspacio = columnas.includes(nombreEnCodigo + ' ');

console.log(`¿Existe sin espacio final? ${existeSinEspacio ? '✅ SÍ' : '❌ NO'}`);
console.log(`¿Existe con espacio final? ${existeConEspacio ? '✅ SÍ' : '❌ NO'}`);

if (!existeSinEspacio && !existeConEspacio) {
  console.log('\n⚠️  NINGUNA VERSIÓN COINCIDE. Columnas similares:');
  const similares = columnas.filter(col => 
    col.includes('Llantas') && col.includes('Labrado')
  );
  similares.forEach(col => {
    console.log(`   "${col}"`);
  });
}

console.log('\n=== MUESTRA DE DATOS (3 primeros registros) ===\n');
data.slice(0, 3).forEach((row, idx) => {
  console.log(`Registro ${idx + 1}:`);
  columnasLlantas.forEach(col => {
    console.log(`  ${col}: ${row[col]}`);
  });
  console.log('');
});
