require('dotenv').config();
const XLSX = require('xlsx');
const path = require('path');

async function analizarExcelCompleto() {
  console.log('🔍 ANÁLISIS COMPLETO DEL EXCEL - VALORES DE LABRADO\n');
  
  // 1. Leer el Excel
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total de registros en Excel: ${data.length}`);
  
  // 2. Identificar la columna de labrado
  const columnas = Object.keys(data[0]);
  const columnasLabrado = columnas.filter(col => 
    col.includes('Llantas') && col.includes('Labrado')
  );
  
  if (columnasLabrado.length === 0) {
    console.log('❌ No se encontró la columna de labrado');
    return;
  }
  
  const nombreColumnaLabrado = columnasLabrado[0];
  console.log(`✅ Columna de labrado: "${nombreColumnaLabrado}"`);
  
  // 3. Analizar TODOS los valores únicos
  const valoresLabrado = data.map(row => row[nombreColumnaLabrado]);
  const valoresUnicos = [...new Set(valoresLabrado.filter(v => v !== null && v !== undefined))];
  
  console.log('\n📋 ANÁLISIS DE VALORES ÚNICOS:');
  console.log(`Total valores únicos: ${valoresUnicos.length}`);
  valoresUnicos.forEach(valor => {
    const count = valoresLabrado.filter(v => v === valor).length;
    const porcentaje = ((count / data.length) * 100).toFixed(1);
    console.log(`  "${valor}": ${count} registros (${porcentaje}%)`);
  });
  
  // 4. Verificar valores nulos o vacíos
  const valoresNull = valoresLabrado.filter(v => v === null || v === undefined || v === '').length;
  if (valoresNull > 0) {
    console.log(`\n⚠️  Valores nulos/vacíos: ${valoresNull} registros`);
  }
  
  // 5. Muestra de registros con diferentes valores
  console.log('\n📝 MUESTRA DE REGISTROS POR VALOR:');
  
  valoresUnicos.forEach(valor => {
    console.log(`\n  Registros con "${valor}":`);
    const ejemplos = data.filter(row => row[nombreColumnaLabrado] === valor).slice(0, 3);
    ejemplos.forEach((ejemplo, i) => {
      const placa = ejemplo['PLACA DEL VEHICULO'] ? 
        String(ejemplo['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const inspector = ejemplo['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(ejemplo['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      console.log(`    ${i + 1}. ${placa} - ${inspector}`);
    });
  });
  
  // 6. Conclusión
  console.log('\n' + '='.repeat(60));
  console.log('📊 CONCLUSIÓN DEL ANÁLISIS');
  console.log('='.repeat(60));
  
  if (valoresUnicos.length === 1 && valoresUnicos[0] === 'CUMPLE') {
    console.log('✅ TODOS los registros del Excel tienen "CUMPLE"');
    console.log('   Esto significa que TODOS deberían tener labrado = true en la BD');
  } else if (valoresUnicos.length === 1 && valoresUnicos[0] === 'NO CUMPLE') {
    console.log('❌ TODOS los registros del Excel tienen "NO CUMPLE"');
    console.log('   Esto significa que TODOS deberían tener labrado = false en la BD');
  } else {
    console.log('📊 El Excel tiene valores mixtos:');
    const cumple = valoresLabrado.filter(v => v === 'CUMPLE').length;
    const noCumple = valoresLabrado.filter(v => v === 'NO CUMPLE').length;
    console.log(`   - CUMPLE: ${cumple} registros (${((cumple/data.length)*100).toFixed(1)}%)`);
    console.log(`   - NO CUMPLE: ${noCumple} registros (${((noCumple/data.length)*100).toFixed(1)}%)`);
    console.log('   La BD debería reflejar esta distribución mixta');
  }
  
  console.log('\n✅ Análisis completado!');
}

analizarExcelCompleto().catch(console.error);