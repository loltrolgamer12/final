const XLSX = require('xlsx');
const path = require('path');

console.log('🧪 PROBANDO LECTURA DE CAMPOS DE FATIGA CON NOMBRES EXACTOS...\n');

// Leer el Excel
const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const workbook = XLSX.readFile(archivoExcel);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Total de registros: ${data.length}\n`);

// Campos exactos como aparecen en el Excel
const camposFatigaExactos = [
  '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
  '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
  '¿Se siente en condiciones físicas y mentales para conducir?', // SIN ESPACIO AL FINAL
  '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
];

// Función para normalizar booleano (igual que el backend)
function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  if (v === "") return false;
  return false;
}

console.log('🔍 VERIFICANDO CAMPOS DE FATIGA:\n');

camposFatigaExactos.forEach((campo, idx) => {
  console.log(`${idx + 1}. "${campo}"`);
  
  // Verificar si existe en el Excel
  const columnas = Object.keys(data[0]);
  const existe = columnas.includes(campo);
  
  console.log(`   Existe en Excel: ${existe ? '✅' : '❌'}`);
  
  if (existe) {
    // Mostrar algunos valores de ejemplo
    const valoresEjemplo = data.slice(0, 10).map(row => row[campo]);
    const valoresUnicos = [...new Set(valoresEjemplo)];
    
    console.log(`   Valores únicos (primeros 10): ${JSON.stringify(valoresUnicos)}`);
    
    // Procesar con normalizeBoolean
    const valoresNormalizados = valoresEjemplo.map(val => normalizeBoolean(val));
    const distribucion = {
      true: valoresNormalizados.filter(v => v === true).length,
      false: valoresNormalizados.filter(v => v === false).length
    };
    
    console.log(`   Distribución normalizada: ${distribucion.true} true, ${distribucion.false} false`);
  }
  
  console.log('');
});

// Tomar una muestra de registros recientes (desde julio) para análisis
console.log('📊 ANÁLISIS DE MUESTRA DE REGISTROS RECIENTES:\n');

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

// Filtrar registros desde julio 2025
const fechaLimite = new Date('2025-07-01');
const registrosRecientes = data.filter(row => {
  const fecha = parseExcelDate(row['Marca temporal']);
  return fecha && fecha >= fechaLimite;
});

console.log(`📅 Registros desde julio 2025: ${registrosRecientes.length}\n`);

if (registrosRecientes.length > 0) {
  console.log('🎯 PROCESANDO MUESTRA DE 5 REGISTROS RECIENTES:\n');
  
  registrosRecientes.slice(0, 5).forEach((row, idx) => {
    const fecha = parseExcelDate(row['Marca temporal']);
    console.log(`=== REGISTRO ${idx + 1} - ${fecha.toLocaleDateString()} ===`);
    
    // Procesar cada campo de fatiga
    camposFatigaExactos.forEach(campo => {
      const valorRaw = row[campo];
      const valorNormalizado = normalizeBoolean(valorRaw);
      
      console.log(`${campo}:`);
      console.log(`   Valor raw: "${valorRaw}"`);
      console.log(`   Normalizado: ${valorNormalizado}`);
    });
    
    // Calcular puntaje de fatiga
    const puntajeFatiga = (
      (normalizeBoolean(row[camposFatigaExactos[0]]) ? 1 : 0) +
      (normalizeBoolean(row[camposFatigaExactos[1]]) ? 1 : 0) +
      (normalizeBoolean(row[camposFatigaExactos[2]]) ? 1 : 0) +
      (normalizeBoolean(row[camposFatigaExactos[3]]) ? 0 : 1) // Medicamentos es inverso
    );
    
    console.log(`   🎯 Puntaje de fatiga calculado: ${puntajeFatiga}/4`);
    console.log(`   ⚠️ Tiene problemas fatiga: ${puntajeFatiga < 2 ? 'SÍ' : 'NO'}\n`);
  });
}

console.log('💡 CONCLUSIÓN:');
console.log('Si todos los campos existen y se procesan correctamente,');
console.log('el problema está resuelto y podemos proceder a recalcular la base de datos.');