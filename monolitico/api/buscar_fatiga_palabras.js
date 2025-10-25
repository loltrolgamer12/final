const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 BUSCAR CAMPOS DE FATIGA POR PALABRAS CLAVE...\n');

const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const columnas = Object.keys(data[0]);
console.log(`📊 Total columnas: ${columnas.length}\n`);

// Buscar por palabras clave
const palabrasClave = {
  'dormido': 'horas de sueño',
  'fatiga': 'síntomas de fatiga', 
  'condiciones': 'condiciones físicas/mentales',
  'medicamentos': 'sustancias/medicamentos'
};

console.log('🔍 BÚSQUEDA POR PALABRAS CLAVE:\n');

const camposEncontrados = {};

Object.keys(palabrasClave).forEach(palabra => {
  console.log(`➡️ Buscando "${palabra}" (${palabrasClave[palabra]}):`);
  
  const encontradas = columnas.filter(col => 
    col.toLowerCase().includes(palabra.toLowerCase())
  );
  
  if (encontradas.length > 0) {
    encontradas.forEach(col => {
      console.log(`   ✅ "${col}"`);
      
      // Mostrar bytes del string para detectar caracteres invisibles
      const bytes = Array.from(col).map(char => char.charCodeAt(0));
      console.log(`   📝 Bytes: [${bytes.join(', ')}]`);
      
      // Mostrar algunos valores
      const valores = data.slice(0, 5).map(row => row[col]);
      console.log(`   🎯 Valores ejemplo: ${JSON.stringify(valores)}\n`);
      
      camposEncontrados[palabra] = col;
    });
  } else {
    console.log(`   ❌ No encontrado\n`);
  }
});

// Si encontramos los campos, hacer prueba completa
if (Object.keys(camposEncontrados).length > 0) {
  console.log('🧪 PROCESANDO CON CAMPOS ENCONTRADOS:\n');
  
  function normalizeBoolean(value) {
    if (value === true || value === 1) return true;
    if (value === false || value === 0) return false;
    if (value === null || value === undefined) return false;
    if (typeof value !== 'string') return false;
    const v = value.trim().toUpperCase();
    if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
    if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
    return false;
  }

  // Usar registros de julio hacia adelante
  const fechaLimite = new Date('2025-07-15'); // Fecha que mencionaste
  
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
  
  const registrosConFatiga = data.filter(row => {
    const fecha = parseExcelDate(row['Marca temporal']);
    return fecha && fecha >= fechaLimite;
  });
  
  console.log(`📅 Registros desde ${fechaLimite.toDateString()}: ${registrosConFatiga.length}\n`);
  
  if (registrosConFatiga.length > 0) {
    console.log('🎯 MUESTRA DE PROCESAMIENTO:\n');
    
    registrosConFatiga.slice(0, 3).forEach((row, idx) => {
      console.log(`=== REGISTRO ${idx + 1} ===`);
      
      Object.keys(camposEncontrados).forEach(palabra => {
        const nombreCampo = camposEncontrados[palabra];
        const valor = row[nombreCampo];
        const normalizado = normalizeBoolean(valor);
        
        console.log(`${palabra}: "${valor}" → ${normalizado}`);
      });
      console.log('');
    });
    
    console.log('✅ NOMBRES DE CAMPOS CORRECTOS PARA EL BACKEND:');
    Object.keys(camposEncontrados).forEach(palabra => {
      console.log(`${palabra}: "${camposEncontrados[palabra]}"`);
    });
  }
} else {
  console.log('❌ No se encontraron campos de fatiga');
  
  // Mostrar las últimas 10 columnas por si están al final
  console.log('\n🔍 ÚLTIMAS 10 COLUMNAS (pueden estar al final):');
  const ultimas = columnas.slice(-10);
  ultimas.forEach((col, idx) => {
    console.log(`${columnas.length - 10 + idx + 1}: "${col}"`);
    // Mostrar bytes
    const bytes = Array.from(col).map(char => char.charCodeAt(0));
    console.log(`   Bytes: [${bytes.slice(0, 20).join(', ')}${bytes.length > 20 ? '...' : ''}]`);
  });
}