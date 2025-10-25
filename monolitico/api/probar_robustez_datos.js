const excelService = require('./src/services/excelService');
const fs = require('fs');
const path = require('path');

console.log('🧪 PROBANDO ROBUSTEZ CONTRA DATOS VACÍOS...\n');

async function probarRobustez() {
  try {
    // 1. Probar con el Excel actual
    console.log('📊 PRUEBA 1: Excel actual completo\n');
    
    const archivoPath = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
    const buffer = fs.readFileSync(archivoPath);
    
    const resultado = await excelService.processExcelFile(buffer, 'test.xlsx', {
      tipo: 'pesado',
      strict: false
    });
    
    console.log('✅ RESULTADO PRUEBA 1:');
    console.log(`   📊 Registros válidos: ${resultado.validRecords?.length || 0}`);
    console.log(`   ❌ Errores: ${resultado.errors?.length || 0}`);
    console.log(`   🔄 Duplicados: ${resultado.duplicates?.length || 0}`);
    console.log(`   ❌ Rechazados: ${resultado.rejectedRecords?.length || 0}\n`);
    
    if (resultado.validRecords?.length > 0) {
      const registro = resultado.validRecords[0];
      console.log('🔍 EJEMPLO DE REGISTRO PROCESADO:');
      console.log(`   Placa: ${registro.placa_vehiculo}`);
      console.log(`   Fecha: ${registro.fecha}`);
      console.log(`   Fatiga - Horas sueño: ${registro.horas_sueno_suficientes}`);
      console.log(`   Fatiga - Sin síntomas: ${registro.libre_sintomas_fatiga}`);
      console.log(`   Fatiga - Condiciones: ${registro.condiciones_aptas}`);
      console.log(`   Fatiga - Medicamentos: ${registro.consumo_medicamentos}`);
      console.log(`   Puntaje fatiga: ${registro.puntaje_fatiga || 'No calculado'}`);
    }
    
    // 2. Estadísticas de fatiga
    if (resultado.validRecords?.length > 0) {
      const conFatiga = resultado.validRecords.filter(r => {
        // Registros que tienen datos reales de fatiga (no valores por defecto)
        return r.horas_sueno_suficientes !== undefined && 
               r.libre_sintomas_fatiga !== undefined &&
               r.condiciones_aptas !== undefined &&
               r.consumo_medicamentos !== undefined;
      });
      
      const distribuciones = {
        horas_sueno_true: resultado.validRecords.filter(r => r.horas_sueno_suficientes === true).length,
        libre_fatiga_true: resultado.validRecords.filter(r => r.libre_sintomas_fatiga === true).length,
        condiciones_true: resultado.validRecords.filter(r => r.condiciones_aptas === true).length,
        sin_medicamentos: resultado.validRecords.filter(r => r.consumo_medicamentos === false).length
      };
      
      console.log('\n📊 DISTRIBUCIONES DE FATIGA:');
      console.log(`   ✅ Con horas suficientes: ${distribuciones.horas_sueno_true}/${resultado.validRecords.length} (${((distribuciones.horas_sueno_true/resultado.validRecords.length)*100).toFixed(1)}%)`);
      console.log(`   ✅ Sin síntomas fatiga: ${distribuciones.libre_fatiga_true}/${resultado.validRecords.length} (${((distribuciones.libre_fatiga_true/resultado.validRecords.length)*100).toFixed(1)}%)`);
      console.log(`   ✅ Condiciones aptas: ${distribuciones.condiciones_true}/${resultado.validRecords.length} (${((distribuciones.condiciones_true/resultado.validRecords.length)*100).toFixed(1)}%)`);
      console.log(`   ✅ Sin medicamentos: ${distribuciones.sin_medicamentos}/${resultado.validRecords.length} (${((distribuciones.sin_medicamentos/resultado.validRecords.length)*100).toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error('❌ Error en prueba:', error.message);
  }
}

probarRobustez();