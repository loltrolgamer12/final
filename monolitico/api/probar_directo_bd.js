require('dotenv').config();
const fs = require('fs');
const path = require('path');
const excelService = require('./src/services/excelService');

async function probarDirectamenteConBD() {
    try {
        console.log('🧪 PROBANDO PROCESAMIENTO DIRECTO CON BD');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        console.log('\n1️⃣ LEYENDO ARCHIVO...');
        const buffer = fs.readFileSync(archivoLigero);
        console.log(`📊 Buffer size: ${buffer.length} bytes`);
        
        console.log('\n2️⃣ PROCESANDO CON LA BD NUEVA...');
        const resultado = await excelService.processExcelFile(buffer, 'HQ-FO-40_test_directo.xlsx', { 
            tipo: 'ligero',
            strict: false 
        });
        
        console.log('\n📊 RESULTADO DEL PROCESAMIENTO:');
        console.log(JSON.stringify(resultado, null, 2));
        
        if (resultado.success) {
            console.log('\n🎉 ¡ÉXITO TOTAL!');
            console.log(`💾 Registros insertados: ${resultado.insertados}`);
            console.log(`📋 Registros válidos: ${resultado.validRecords}`);
            console.log(`🔄 Duplicados: ${resultado.duplicates}`);
            console.log(`❌ Errores: ${resultado.errors}`);
            console.log(`📁 Total procesados: ${resultado.totalRecords}`);
            
            console.log('\n✅ LOS ARCHIVOS LIGEROS FUNCIONAN PERFECTAMENTE');
        } else {
            console.log('\n❌ Error en el procesamiento:');
            console.log(resultado.error);
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

probarDirectamenteConBD();