const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 COMPARANDO ESTRUCTURAS DE REGISTROS ANTES Y DESPUÉS DEL 15 DE JULIO...\n');

// Leer el Excel
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Función para convertir fecha de Excel
function parseExcelDate(excelDate) {
  if (!excelDate) return null;
  
  if (typeof excelDate === 'string') {
    const d = new Date(excelDate);
    return isNaN(d.getTime()) ? null : d;
  }
  
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
}

// Separar registros por fecha
const fechaLimite = new Date('2025-07-15');
let registroAntes = null;
let registroDespues = null;

// Encontrar un registro representativo de cada período
for (const row of data) {
  const fecha = parseExcelDate(row['Marca temporal']);
  
  if (fecha && fecha < fechaLimite && !registroAntes) {
    registroAntes = { row, fecha };
  }
  
  if (fecha && fecha >= fechaLimite && !registroDespues) {
    registroDespues = { row, fecha };
  }
  
  if (registroAntes && registroDespues) break;
}

if (!registroAntes || !registroDespues) {
  console.log('❌ No se pudieron encontrar registros representativos de ambos períodos');
  process.exit(1);
}

console.log(`📅 Registro ANTES: ${registroAntes.fecha.toLocaleDateString()}`);
console.log(`📅 Registro DESPUÉS: ${registroDespues.fecha.toLocaleDateString()}\n`);

// Obtener columnas de cada registro
const columnasAntes = Object.keys(registroAntes.row);
const columnasDespues = Object.keys(registroDespues.row);

console.log(`📊 Columnas ANTES: ${columnasAntes.length}`);
console.log(`📊 Columnas DESPUÉS: ${columnasDespues.length}\n`);

// Encontrar columnas que aparecieron después
const columnasNuevas = columnasDespues.filter(col => !columnasAntes.includes(col));
const columnasEliminadas = columnasAntes.filter(col => !columnasDespues.includes(col));

console.log('🆕 COLUMNAS QUE APARECIERON DESPUÉS DEL 15 DE JULIO:');
if (columnasNuevas.length > 0) {
  columnasNuevas.forEach((col, idx) => {
    const valor = registroDespues.row[col];
    console.log(`${idx + 1}. "${col}"`);
    console.log(`   Valor ejemplo: "${valor}"\n`);
  });
} else {
  console.log('   ❌ Ninguna columna nueva encontrada\n');
}

console.log('🗑️ COLUMNAS QUE SE ELIMINARON DESPUÉS DEL 15 DE JULIO:');
if (columnasEliminadas.length > 0) {
  columnasEliminadas.forEach((col, idx) => {
    console.log(`${idx + 1}. "${col}"`);
  });
} else {
  console.log('   ❌ Ninguna columna eliminada\n');
}

// Buscar columnas relacionadas con fatiga en registros después del 15 de julio
console.log('🔍 BUSCANDO COLUMNAS RELACIONADAS CON FATIGA EN REGISTROS RECIENTES:\n');

const palabrasClave = ['fatiga', 'sueño', 'dormido', 'horas', 'medicament', 'condiciones', 'física', 'mental', 'alert'];

const columnasRelacionadas = columnasDespues.filter(col => {
  const colLower = col.toLowerCase();
  return palabrasClave.some(palabra => colLower.includes(palabra));
});

if (columnasRelacionadas.length > 0) {
  console.log('🎯 COLUMNAS POTENCIALMENTE DE FATIGA ENCONTRADAS:');
  columnasRelacionadas.forEach((col, idx) => {
    const valor = registroDespues.row[col];
    console.log(`${idx + 1}. "${col}"`);
    console.log(`   Valor ejemplo: "${valor}"\n`);
  });
} else {
  console.log('❌ No se encontraron columnas relacionadas con fatiga');
}

// Mostrar algunas columnas al final del Excel (pueden ser las nuevas)
console.log('🔍 ÚLTIMAS 10 COLUMNAS DEL REGISTRO RECIENTE:');
const ultimasColumnas = columnasDespues.slice(-10);
ultimasColumnas.forEach((col, idx) => {
  const valor = registroDespues.row[col];
  console.log(`${ultimasColumnas.length - 9 + idx}. "${col}"`);
  console.log(`   Valor: "${valor}"\n`);
});

console.log('💡 SIGUIENTE PASO:');
console.log('Si no vemos campos de fatiga aquí, es posible que:');
console.log('1. Estén en un Excel diferente/más reciente');
console.log('2. Tengan nombres completamente diferentes');
console.log('3. El Excel actual no tenga la versión con campos de fatiga');
console.log('4. Necesites proporcionar el Excel correcto con esos campos');