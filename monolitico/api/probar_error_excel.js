require('dotenv').config();
const excelService = require('./src/services/excelService');
const fs = require('fs');
const path = require('path');

async function probarProcesamientoExcel() {
  console.log('🧪 PROBANDO PROCESAMIENTO DE EXCEL CON DATOS REALES...\n');
  
  try {
    // Usar el archivo Excel de vehículos ligeros que se subió
    const archivoPath = path.join(__dirname, '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. 8-10-2025.xlsx');
    
    if (!fs.existsSync(archivoPath)) {
      console.log('❌ Archivo no encontrado. Archivos disponibles:');
      const archivos = fs.readdirSync(path.join(__dirname, '../../pruebas'));
      archivos.forEach(archivo => console.log(`   - ${archivo}`));
      return;
    }
    
    // Leer el archivo
    const buffer = fs.readFileSync(archivoPath);
    const filename = path.basename(archivoPath);
    
    console.log(`📁 Procesando archivo: ${filename}`);
    console.log(`📊 Tamaño del archivo: ${Math.round(buffer.length / 1024)} KB\n`);
    
    // Procesar como vehículo ligero
    const resultado = await excelService.processExcelFile(buffer, filename, { tipo: 'ligero' });
    
    console.log('📊 RESULTADO DEL PROCESAMIENTO:');
    console.log(`   ✅ Registros válidos: ${resultado.validRecords}`);
    console.log(`   ❌ Registros rechazados: ${resultado.rejectedRecords}`);
    console.log(`   🔄 Duplicados encontrados: ${resultado.duplicates}`);
    console.log(`   💾 Registros insertados: ${resultado.inserted}`);
    console.log(`   ⚠️ Errores: ${resultado.errors?.length || 0}`);
    
    if (resultado.errors && resultado.errors.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      resultado.errors.forEach((error, idx) => {
        console.log(`${idx + 1}. ${error}`);
      });
    }
    
    if (resultado.rejectedRecords > 0 && resultado.rejectedReasons) {
      console.log('\n⚠️ RAZONES DE RECHAZO:');
      Object.keys(resultado.rejectedReasons).forEach(razon => {
        console.log(`   ${razon}: ${resultado.rejectedReasons[razon]} registros`);
      });
    }
    
    console.log('\n💡 DIAGNÓSTICO:');
    if (resultado.inserted === 0 && resultado.validRecords > 0) {
      console.log('❌ Problema: Hay registros válidos pero no se insertan');
      console.log('   Posibles causas:');
      console.log('   1. Error en la conexión a la base de datos');
      console.log('   2. Error en las consultas SQL');
      console.log('   3. Problema con la validación de registros');
      console.log('   4. Todos los registros se consideran duplicados');
    } else if (resultado.inserted > 0) {
      console.log('✅ Procesamiento exitoso');
    } else {
      console.log('⚠️ No hay registros para procesar');
    }
    
  } catch (error) {
    console.error('❌ ERROR EN EL PROCESAMIENTO:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
  }
}

probarProcesamientoExcel();