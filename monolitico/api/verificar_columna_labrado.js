const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

console.log('🔍 VERIFICANDO NOMBRE EXACTO DE LA COLUMNA DE LABRADO...\n');

// Buscar archivo Excel de pesados
const posiblesArchivos = [
  'HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (5).xlsx',
  'HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas).xlsx',
  '../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS.xlsx'
];

let archivoEncontrado = null;
for (const archivo of posiblesArchivos) {
  const rutaCompleta = path.join(__dirname, archivo);
  if (fs.existsSync(rutaCompleta)) {
    archivoEncontrado = rutaCompleta;
    console.log(`✅ Archivo encontrado: ${archivo}\n`);
    break;
  }
}

if (!archivoEncontrado) {
  console.log('❌ No se encontró ningún archivo de Excel de vehículos pesados');
  console.log('Archivos buscados:');
  posiblesArchivos.forEach(a => console.log(`  - ${a}`));
  process.exit(1);
}

const workbook = XLSX.readFile(archivoEncontrado);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const columnas = Object.keys(data[0]);

console.log('=== COLUMNAS RELACIONADAS CON LLANTAS/LABRADO ===\n');

const columnasLlantas = columnas.filter(col => 
  col.toLowerCase().includes('llanta') || 
  col.toLowerCase().includes('labrado') ||
  col.toLowerCase().includes('neumatico')
);

if (columnasLlantas.length === 0) {
  console.log('❌ No se encontraron columnas relacionadas con llantas/labrado');
} else {
  columnasLlantas.forEach((col, idx) => {
    console.log(`${idx + 1}. Nombre exacto (con espacios y todo):`);
    console.log(`   "${col}"`);
    console.log(`   Longitud: ${col.length} caracteres`);
    console.log(`   Empieza con: "${col.substring(0, 10)}..."`);
    console.log(`   Termina con: "...${col.substring(col.length - 10)}"`);
    
    // Mostrar valores de ejemplo
    const valores = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const valoresUnicos = [...new Set(valores)];
    console.log(`   Valores únicos: ${valoresUnicos.join(', ')}`);
    console.log('');
  });
}

console.log('\n=== COMPARACIÓN CON CÓDIGO ACTUAL ===\n');
console.log('Código actual usa:');
console.log('   "**Llantas - Labrado (min 3mm de labrado) "');
console.log('');

const nombreEnCodigo = '**Llantas - Labrado (min 3mm de labrado) ';
const existeEnExcel = columnas.includes(nombreEnCodigo);

if (existeEnExcel) {
  console.log('✅ El nombre en el código COINCIDE exactamente');
} else {
  console.log('❌ El nombre en el código NO coincide');
  
  // Buscar coincidencias parciales
  const similares = columnas.filter(col => 
    col.includes('Llantas') && col.includes('Labrado')
  );
  
  if (similares.length > 0) {
    console.log('\nColumnas similares encontradas:');
    similares.forEach(col => {
      console.log(`   "${col}"`);
      if (col.trim() === nombreEnCodigo.trim()) {
        console.log('   ⚠️  Solo difiere en espacios al inicio/final');
      }
    });
  }
}

console.log('\n=== MUESTRA DE DATOS (3 primeros registros) ===\n');
data.slice(0, 3).forEach((row, idx) => {
  console.log(`Registro ${idx + 1}:`);
  columnasLlantas.forEach(col => {
    console.log(`  ${col}: ${row[col]}`);
  });
  console.log('');
});
