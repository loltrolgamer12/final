const XLSX = require('xlsx');
const path = require('path');

console.log('� EXTRAYENDO DATOS DE SEPTIEMBRE Y OCTUBRE 2025...\n');

// Leer el archivo original
const inputFile = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (5).xlsx');
const workbook = XLSX.readFile(inputFile);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Total registros en archivo original: ${data.length}`);

// Función para convertir fecha serial de Excel a Date
function excelDateToJS(serial) {
  if (typeof serial === 'string') {
    // Ya es fecha en string
    return new Date(serial);
  }
  // Es fecha serial de Excel
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

// Filtrar registros de septiembre y octubre 2025
const registrosFiltrados = data.filter(row => {
  const marcaTemporal = row['Marca temporal'];
  if (!marcaTemporal) return false;
  
  const fecha = excelDateToJS(marcaTemporal);
  const year = fecha.getFullYear();
  const month = fecha.getMonth() + 1; // 0-indexed
  
  // Septiembre (mes 9) y Octubre (mes 10) de 2025
  return year === 2025 && (month === 9 || month === 10);
});

console.log(`✅ Registros de Septiembre-Octubre 2025: ${registrosFiltrados.length}`);

// Análisis de fechas
if (registrosFiltrados.length > 0) {
  const fechas = registrosFiltrados.map(r => {
    const fecha = excelDateToJS(r['Marca temporal']);
    return {
      original: r['Marca temporal'],
      fecha: fecha,
      mes: fecha.getMonth() + 1,
      anio: fecha.getFullYear()
    };
  });
  
  const septiembre = fechas.filter(f => f.mes === 9).length;
  const octubre = fechas.filter(f => f.mes === 10).length;
  
  console.log(`\n📅 Distribución:`);
  console.log(`   Septiembre 2025: ${septiembre} registros`);
  console.log(`   Octubre 2025: ${octubre} registros`);

console.log(`Registros de Septiembre 2024: ${data.filter(r => {
  const f = excelDateToJS(r['Marca temporal']);
  return f && f.getFullYear() === 2024 && f.getMonth() === 8;
}).length}`);

console.log(`\nTotal registros filtrados: ${registrosFiltrados.length}`);

if (registrosFiltrados.length === 0) {
  console.log('\n❌ No se encontraron registros de agosto/septiembre 2024');
  console.log('\nVerificando rango de fechas en el archivo:');
  
  const fechas = data.map(r => excelDateToJS(r['Marca temporal'])).filter(f => f).sort((a, b) => a - b);
  if (fechas.length > 0) {
    console.log(`  Primera fecha: ${fechas[0].toISOString().split('T')[0]}`);
    console.log(`  Última fecha: ${fechas[fechas.length - 1].toISOString().split('T')[0]}`);
  }
  
  process.exit(1);
}

// Crear nuevo workbook con los datos filtrados
const nuevoWb = XLSX.utils.book_new();
const nuevaHoja = XLSX.utils.json_to_sheet(registrosFiltrados);
XLSX.utils.book_append_sheet(nuevoWb, nuevaHoja, 'Agosto-Septiembre 2024');

  // Verificar si tienen campos de fatiga
  const primerRegistro = registrosFiltrados[0];
  const columnas = Object.keys(primerRegistro);
  
  const camposFatiga = columnas.filter(c => 
    c.toLowerCase().includes('fatiga') || 
    c.toLowerCase().includes('medicamento') || 
    c.toLowerCase().includes('dormido') ||
    c.toLowerCase().includes('sueño')
  );
  
  console.log(`\n📋 Campos de fatiga encontrados: ${camposFatiga.length}`);
  if (camposFatiga.length > 0) {
    camposFatiga.forEach(c => console.log(`   ✅ ${c}`));
  } else {
    console.log(`   ❌ NO se encontraron campos de fatiga en estos registros`);
  }
}

// Crear nuevo workbook con los datos filtrados
const nuevoWorkbook = XLSX.utils.book_new();
const nuevaHoja = XLSX.utils.json_to_sheet(registrosFiltrados);

// Agregar la hoja al workbook
XLSX.utils.book_append_sheet(nuevoWorkbook, nuevaHoja, 'SEPT-OCT 2025');

// Guardar el archivo
const outputFile = path.join(__dirname, '../../pruebas/HQ-FO-41_PESADOS_SEP-OCT-2025.xlsx');
XLSX.writeFile(nuevoWorkbook, outputFile);

console.log(`\n✅ Archivo creado exitosamente:`);
console.log(`📁 ${outputFile}`);
console.log(`📊 ${registrosFiltrados.length} registros exportados`);

// Mostrar muestra de fechas
if (registrosFiltrados.length > 0) {
  console.log(`\n📅 Muestra de fechas (primeras 5):`);
  registrosFiltrados.slice(0, 5).forEach((r, i) => {
    const fecha = excelDateToJS(r['Marca temporal']);
    console.log(`   ${i + 1}. ${fecha.toISOString().split('T')[0]} - Placa: ${r['PLACA DEL VEHICULO']}`);
  });
}

console.log('\n✅ Proceso completado');
