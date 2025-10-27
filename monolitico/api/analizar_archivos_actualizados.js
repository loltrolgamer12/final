const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANALIZANDO ARCHIVOS DE PRUEBA ACTUALIZADOS...\n');

// Analizar ambos archivos
const archivos = [
  '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx',
  '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (13).xlsx'
];

archivos.forEach((archivoPath, idx) => {
  const archivoCompleto = path.join(__dirname, archivoPath);
  const nombreArchivo = path.basename(archivoPath);
  const tipo = nombreArchivo.includes('LIVIANO') ? 'LIGERO' : 'PESADO';
  
  console.log(`${'='.repeat(80)}`);
  console.log(`ANÁLISIS ${idx + 1}: ${tipo} - ${nombreArchivo}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    // Leer Excel
    const workbook = XLSX.readFile(archivoCompleto);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Obtener rango y encabezados
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 0 })[0];
    
    console.log(`📊 Rango del sheet: ${range.s.c + 1} a ${range.e.c + 1} columnas, ${range.e.r + 1} filas`);
    console.log(`📋 Encabezados encontrados: ${headerRow.length}\n`);
    
    // Mostrar encabezados
    console.log('📋 ENCABEZADOS:');
    headerRow.forEach((col, i) => {
      const colStr = col || 'VACIO';
      console.log(`${(i + 1).toString().padStart(3)}: "${colStr}"`);
    });
    
    // Buscar campos clave
    const camposClave = {
      placa: ['PLACA DEL VEHICULO', 'PLACA DEL VEHÍCULO'],
      fecha: ['Marca temporal'],
      inspector: ['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN', 'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN '],
      conductor: tipo === 'LIGERO' ? [] : ['CONDUCTOR', 'NOMBRE DEL CONDUCTOR'],
      fatiga: [
        '¿Ha dormido al menos 7 horas en las últimas 24 horas?',
        '¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?',
        '¿Se siente en condiciones físicas y mentales para conducir?',
        '¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'
      ]
    };
    
    console.log('\n🔍 VERIFICACIÓN DE CAMPOS CLAVE:\n');
    
    Object.keys(camposClave).forEach(categoria => {
      console.log(`➡️ ${categoria.toUpperCase()}:`);
      
      const patrones = camposClave[categoria];
      if (patrones.length === 0) {
        console.log('   🔵 No aplica para este tipo de vehículo\n');
        return;
      }
      
      patrones.forEach(patron => {
        const encontrado = headerRow.find(col => col && col.includes ? col.includes(patron.substring(0, 20)) : false);
        const exacto = headerRow.includes(patron);
        
        if (exacto) {
          console.log(`   ✅ EXACTO: "${patron}"`);
        } else if (encontrado) {
          console.log(`   ⚠️ SIMILAR: "${encontrado}" (buscaba: "${patron}")`);
        } else {
          console.log(`   ❌ NO ENCONTRADO: "${patron}"`);
        }
      });
      console.log('');
    });
    
    // Analizar datos de muestra
    const data = XLSX.utils.sheet_to_json(sheet, {
      header: headerRow,
      range: 1
    });
    
    console.log(`📊 Filas de datos: ${data.length}\n`);
    
    if (data.length > 0) {
      console.log('🔍 MUESTRA DE DATOS (primera fila):\n');
      
      const primeraFila = data[0];
      
      // Mostrar campos importantes
      const camposImportantes = [
        'Marca temporal',
        'PLACA DEL VEHICULO',
        'PLACA DEL VEHÍCULO',
        'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN',
        'NOMBRE DE QUIEN REALIZA LA INSPECCIÓN '
      ];
      
      camposImportantes.forEach(campo => {
        const valor = primeraFila[campo];
        if (valor !== undefined) {
          console.log(`${campo}: "${valor}"`);
        }
      });
      
      // Verificar campos de fatiga
      console.log('\n🧠 CAMPOS DE FATIGA:');
      camposClave.fatiga.forEach(campo => {
        const valor = primeraFila[campo];
        if (valor !== undefined) {
          console.log(`${campo}: "${valor}"`);
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ Error analizando archivo: ${error.message}`);
  }
  
  console.log('\n');
});

console.log('💡 RESUMEN DE CORRECCIONES NECESARIAS:');
console.log('1. Verificar nombres exactos de campos entre archivos');
console.log('2. Ajustar lógica de detección de campos clave');
console.log('3. Probar procesamiento con archivos reales');
console.log('4. Verificar que los valores se procesen correctamente');