require('dotenv').config();
const excelService = require('./src/services/excelService');
const fs = require('fs');
const path = require('path');

async function probarAmbosArchivos() {
  console.log('🧪 PROBANDO PROCESAMIENTO DE AMBOS ARCHIVOS ACTUALIZADOS...\n');
  
  const archivos = [
    {
      path: '../../pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx',
      tipo: 'ligero',
      nombre: 'Vehículos Ligeros'
    },
    {
      path: '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (13).xlsx',
      tipo: 'pesado',
      nombre: 'Vehículos Pesados'
    }
  ];
  
  for (const archivo of archivos) {
    console.log(`${'='.repeat(80)}`);
    console.log(`PROCESANDO: ${archivo.nombre.toUpperCase()}`);
    console.log(`${'='.repeat(80)}\n`);
    
    try {
      const archivoCompleto = path.join(__dirname, archivo.path);
      
      if (!fs.existsSync(archivoCompleto)) {
        console.log(`❌ Archivo no encontrado: ${archivoCompleto}\n`);
        continue;
      }
      
      // Leer el archivo
      const buffer = fs.readFileSync(archivoCompleto);
      const filename = path.basename(archivo.path);
      
      console.log(`📁 Archivo: ${filename}`);
      console.log(`📊 Tamaño: ${Math.round(buffer.length / 1024)} KB`);
      console.log(`🔧 Tipo: ${archivo.tipo}\n`);
      
      // Procesar
      console.log('🔄 Procesando...\n');
      const resultado = await excelService.processExcelFile(buffer, filename, { tipo: archivo.tipo });
      
      console.log('📊 RESULTADO:');
      console.log(`   ✅ Registros válidos: ${resultado.validRecords || 0}`);
      console.log(`   ❌ Registros rechazados: ${resultado.rejectedRecords || 0}`);
      console.log(`   🔄 Duplicados: ${resultado.duplicates || 0}`);
      console.log(`   💾 Insertados: ${resultado.inserted || 0}`);
      console.log(`   ⚠️ Errores: ${resultado.errors?.length || 0}\n`);
      
      // Análisis detallado
      if (resultado.validRecords === 0) {
        console.log('❌ PROBLEMA: No hay registros válidos');
        console.log('   Posibles causas:');
        console.log('   - Campos clave no encontrados (placa, fecha, inspector)');
        console.log('   - Formato de datos incorrecto');
        console.log('   - Error en el parser de Excel\n');
      } else if (resultado.inserted === 0 && resultado.validRecords > 0) {
        console.log('⚠️ PROBLEMA: Registros válidos pero no insertados');
        console.log('   Posibles causas:');
        console.log('   - Todos considerados duplicados');
        console.log('   - Error en base de datos');
        console.log('   - Error en validación final\n');
      } else {
        console.log('✅ PROCESAMIENTO EXITOSO\n');
      }
      
      // Mostrar errores si los hay
      if (resultado.errors && resultado.errors.length > 0) {
        console.log('❌ ERRORES DETALLADOS:');
        resultado.errors.slice(0, 5).forEach((error, idx) => {
          console.log(`${idx + 1}. ${error}`);
        });
        console.log('');
      }
      
      // Mostrar razones de rechazo
      if (resultado.rejectedRecords > 0 && resultado.rejectedReasons) {
        console.log('⚠️ RAZONES DE RECHAZO:');
        Object.keys(resultado.rejectedReasons).forEach(razon => {
          console.log(`   ${razon}: ${resultado.rejectedReasons[razon]} registros`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.error(`❌ ERROR PROCESANDO ${archivo.nombre}:`);
      console.error(`Mensaje: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
      console.log('');
    }
  }
  
  console.log(`${'='.repeat(80)}`);
  console.log('RESUMEN FINAL');
  console.log(`${'='.repeat(80)}`);
  console.log('Si ambos archivos procesan correctamente, el sistema está listo.');
  console.log('Si hay errores, necesitamos corregir la lógica de procesamiento.');
}

probarAmbosArchivos();