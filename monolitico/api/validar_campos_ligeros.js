const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 VALIDACIÓN COMPLETA DE CAMPOS - VEHÍCULOS LIGEROS\n');

const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. 8-10-2025.xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const columnas = Object.keys(data[0]);

console.log(`Total de columnas en Excel: ${columnas.length}\n`);
console.log('=' .repeat(80));
console.log('LISTADO COMPLETO DE COLUMNAS DEL EXCEL');
console.log('='.repeat(80));
console.log('');

columnas.forEach((col, idx) => {
  // Mostrar espacios y tabs visibles
  const conEspeciales = col
    .split('')
    .map(c => {
      if (c === ' ') return '·';
      if (c === '\t') return '→';
      return c;
    })
    .join('');
  
  console.log(`${(idx + 1).toString().padStart(3, '0')}. "${col}"`);
  console.log(`     Visualizado: "${conEspeciales}"`);
  console.log(`     Longitud: ${col.length} caracteres`);
  
  // Mostrar valores únicos si son pocos
  const valores = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
  const valoresUnicos = [...new Set(valores)];
  
  if (valoresUnicos.length <= 5 && valoresUnicos.length > 0) {
    console.log(`     Valores: ${valoresUnicos.join(', ')}`);
  }
  console.log('');
});

console.log('\n' + '='.repeat(80));
console.log('CAMPOS QUE PROBABLEMENTE NECESITAN CORRECCIÓN (terminan con espacios/tabs)');
console.log('='.repeat(80));
console.log('');

const camposConEspacios = columnas.filter(col => 
  col.endsWith(' ') || col.endsWith('\t') || col.startsWith(' ')
);

if (camposConEspacios.length === 0) {
  console.log('✅ No hay campos con espacios o tabs al inicio/final\n');
} else {
  camposConEspacios.forEach(col => {
    const conEspeciales = col
      .split('')
      .map(c => {
        if (c === ' ') return '·';
        if (c === '\t') return '→';
        return c;
      })
      .join('');
    
    console.log(`"${col}"`);
    console.log(`Visualizado: "${conEspeciales}"`);
    console.log('');
  });
}
