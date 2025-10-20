const XLSX = require('xlsx');
const path = require('path');

const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS 1.xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const columnas = Object.keys(data[0]);

console.log('🔍 ANALIZANDO COLUMNA DE LABRADO...\n');

const columnasLabrado = columnas.filter(col => 
  col.includes('Labrado') && col.includes('Llantas')
);

columnasLabrado.forEach(col => {
  console.log('Nombre de columna encontrado:');
  console.log(`Texto completo: "${col}"`);
  console.log(`Longitud total: ${col.length} caracteres`);
  console.log('');
  
  console.log('Análisis caracter por caracter:');
  for (let i = 0; i < col.length; i++) {
    const char = col[i];
    const code = char.charCodeAt(0);
    console.log(`  [${i}] "${char}" (código ASCII: ${code})`);
  }
  console.log('');
  
  // Contar espacios al final
  let espaciosFinales = 0;
  for (let i = col.length - 1; i >= 0; i--) {
    if (col[i] === ' ') {
      espaciosFinales++;
    } else {
      break;
    }
  }
  console.log(`Espacios al final: ${espaciosFinales}`);
  console.log('');
  
  // Probar el valor
  console.log('Valores de ejemplo:');
  data.slice(0, 3).forEach((row, idx) => {
    console.log(`  Registro ${idx + 1}: ${row[col]}`);
  });
});
