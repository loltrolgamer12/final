const excelParser = require('./src/utils/excelParser');
const fs = require('fs');
const path = require('path');

console.log('🧪 PROBANDO EL PARSER DE EXCEL ACTUALIZADO...\n');

// Leer el archivo Excel
const archivoPath = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
const buffer = fs.readFileSync(archivoPath);

// Usar el parser actualizado
const data = excelParser.parseExcel(buffer);

console.log(`📊 Datos procesados: ${data.length} registros\n`);

if (data.length > 0) {
  const primerRegistro = data[0];
  const columnas = Object.keys(primerRegistro);
  
  console.log(`📋 Columnas encontradas: ${columnas.length}\n`);
  
  // Buscar campos de fatiga
  const camposFatiga = [
    '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
    '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
    '¿Se siente en condiciones físicas y mentales para conducir? ', // CON ESPACIO
    '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
  ];
  
  console.log('🔍 VERIFICANDO CAMPOS DE FATIGA:\n');
  
  camposFatiga.forEach((campo, idx) => {
    const existe = columnas.includes(campo);
    console.log(`${idx + 1}. "${campo}"`);
    console.log(`   Presente: ${existe ? '✅' : '❌'}`);
    
    if (existe) {
      // Mostrar valores de los primeros 5 registros
      const valores = data.slice(0, 5).map(row => row[campo]);
      console.log(`   Valores ejemplo: ${JSON.stringify(valores)}`);
    }
    console.log('');
  });
  
  // Buscar registros que tengan datos de fatiga (no vacíos)
  console.log('🔍 ANALIZANDO REGISTROS CON DATOS DE FATIGA:\n');
  
  const registrosConFatiga = data.filter(row => {
    return camposFatiga.some(campo => {
      const valor = row[campo];
      return valor && valor.trim() !== '';
    });
  });
  
  console.log(`📊 Registros con al menos un campo de fatiga: ${registrosConFatiga.length}/${data.length}\n`);
  
  if (registrosConFatiga.length > 0) {
    console.log('🎯 MUESTRA DE REGISTROS CON FATIGA:\n');
    
    registrosConFatiga.slice(0, 3).forEach((row, idx) => {
      console.log(`=== REGISTRO ${idx + 1} ===`);
      console.log(`Fecha: ${row['Marca temporal']}`);
      console.log(`Placa: ${row['PLACA DEL VEHICULO']}`);
      
      camposFatiga.forEach(campo => {
        const valor = row[campo];
        console.log(`${campo}: "${valor}"`);
      });
      console.log('');
    });
  }
  
  // Análisis por fechas
  function parseDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
  
  const fechaLimite = new Date('2025-07-15');
  const registrosRecientes = data.filter(row => {
    const fecha = parseDate(row['Marca temporal']);
    return fecha && fecha >= fechaLimite;
  });
  
  console.log(`📅 Registros desde el 15 de julio: ${registrosRecientes.length}\n`);
  
  const registrosRecientesConFatiga = registrosRecientes.filter(row => {
    return camposFatiga.some(campo => {
      const valor = row[campo];
      return valor && valor.trim() !== '';
    });
  });
  
  console.log(`📊 Registros recientes CON datos de fatiga: ${registrosRecientesConFatiga.length}/${registrosRecientes.length}\n`);
  
} else {
  console.log('❌ No se pudieron procesar datos del Excel');
}