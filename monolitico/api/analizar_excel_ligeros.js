const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANALIZANDO ESTRUCTURA DEL EXCEL DE VEHÍCULOS LIGEROS...\n');

// Leer el Excel de vehículos ligeros
const archivoPath = path.join(__dirname, '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. 8-10-2025.xlsx');
const workbook = XLSX.readFile(archivoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Obtener todos los encabezados
const headerRow = XLSX.utils.sheet_to_json(sheet, { 
  header: 1, 
  range: 0 
})[0];

console.log(`📊 Total de encabezados: ${headerRow.length}\n`);

console.log('📋 LISTADO COMPLETO DE COLUMNAS:');
headerRow.forEach((col, idx) => {
  const colStr = col || 'VACIO';
  console.log(`${(idx + 1).toString().padStart(3)}: "${colStr}"`);
});

// Buscar campos clave
const camposClave = {
  'placa': ['PLACA', 'PLACA DEL VEHICULO', 'PLACA_VEHICULO'],
  'fecha': ['MARCA TEMPORAL', 'FECHA', 'TIMESTAMP'],
  'inspector': ['INSPECTOR', 'NOMBRE DE QUIEN REALIZA', 'CONDUCTOR', 'NOMBRE_INSPECTOR'],
  'conductor': ['CONDUCTOR', 'NOMBRE DEL CONDUCTOR', 'CONDUCTOR_NOMBRE']
};

console.log('\n🔍 BÚSQUEDA DE CAMPOS CLAVE:\n');

Object.keys(camposClave).forEach(tipo => {
  console.log(`➡️ Buscando campo ${tipo.toUpperCase()}:`);
  
  const encontrados = headerRow.filter(col => {
    if (!col) return false;
    const colUpper = col.toString().toUpperCase();
    
    return camposClave[tipo].some(patron => 
      colUpper.includes(patron.toUpperCase())
    );
  });
  
  if (encontrados.length > 0) {
    console.log(`   ✅ Encontrados: ${encontrados.length}`);
    encontrados.forEach(col => console.log(`      - "${col}"`));
  } else {
    console.log(`   ❌ No encontrado`);
  }
  console.log('');
});

// Analizar algunas filas de datos
const data = XLSX.utils.sheet_to_json(sheet, {
  header: headerRow,
  range: 1
});

console.log(`📊 Filas de datos: ${data.length}\n`);

if (data.length > 0) {
  console.log('🔍 MUESTRA DE DATOS (primeras 3 filas):\n');
  
  data.slice(0, 3).forEach((row, idx) => {
    console.log(`=== FILA ${idx + 1} ===`);
    
    // Mostrar los primeros 10 campos con sus valores
    const campos = Object.keys(row);
    campos.slice(0, 10).forEach(campo => {
      const valor = row[campo];
      if (valor && valor.toString().trim() !== '') {
        console.log(`${campo}: "${valor}"`);
      }
    });
    console.log('');
  });
  
  // Verificar si hay datos en campos clave
  console.log('🔍 VERIFICACIÓN DE DATOS EN CAMPOS CLAVE:\n');
  
  const primeraFila = data[0];
  Object.keys(camposClave).forEach(tipo => {
    console.log(`➡️ ${tipo.toUpperCase()}:`);
    
    const camposEncontrados = headerRow.filter(col => {
      if (!col) return false;
      const colUpper = col.toString().toUpperCase();
      return camposClave[tipo].some(patron => 
        colUpper.includes(patron.toUpperCase())
      );
    });
    
    if (camposEncontrados.length > 0) {
      camposEncontrados.forEach(campo => {
        const valor = primeraFila[campo];
        console.log(`   "${campo}": "${valor || 'VACIO'}"`);
      });
    } else {
      console.log(`   ❌ Campo no encontrado`);
    }
    console.log('');
  });
}