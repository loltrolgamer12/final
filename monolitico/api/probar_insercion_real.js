require('dotenv').config();
const path = require('path');
const excelService = require('./src/services/excelService');

async function probarInsercionReal() {
    try {
        console.log('🧪 PROBANDO INSERCIÓN REAL EN BASE DE DATOS');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        // Leer archivo como buffer (como lo hace el endpoint real)
        console.log('\n1️⃣ LEYENDO ARCHIVO...');
        const fs = require('fs');
        const buffer = fs.readFileSync(archivoLigero);
        console.log(`📊 Buffer size: ${buffer.length} bytes`);
        
        // Usar la función processExcelFile que es la que usa el endpoint real
        console.log('\n2️⃣ PROCESANDO CON processExcelFile (función real del endpoint)...');
        const filename = 'TEST_HQ-FO-40_ligero.xlsx';
        const options = {
            tipo: 'ligero',
            strict: false, // modo permisivo
            batchSize: 50  // lotes más pequeños para test
        };
        
        const resultado = await excelService.processExcelFile(buffer, filename, options);
        
        console.log('\n📊 RESULTADO DEL PROCESAMIENTO REAL:');
        console.log(`   ✅ Registros válidos: ${resultado.validRecords || resultado.registrosValidos || 'undefined'}`);
        console.log(`   ❌ Registros rechazados: ${resultado.rechazados || resultado.registrosRechazados || 'undefined'}`);
        console.log(`   🔄 Duplicados: ${resultado.duplicates || resultado.duplicados || 'undefined'}`);
        console.log(`   💾 Insertados: ${resultado.insertados || 'undefined'}`);
        console.log(`   ⚠️ Errores: ${resultado.errors || resultado.errores || 'undefined'}`);
        console.log(`   📁 Archivo registrado: ${resultado.success ? 'Sí' : 'No'}`);
        
        // Mostrar el resultado completo para debug
        console.log('\n🔍 RESULTADO COMPLETO:');
        console.log(JSON.stringify(resultado, null, 2));
        
        if (resultado.insertados > 0) {
            console.log('\n✅ ¡INSERCIÓN EXITOSA!');
        } else {
            console.log('\n❌ NO SE INSERTARON REGISTROS');
            
            if (resultado.error) {
                console.log(`💥 ERROR: ${resultado.error}`);
            }
            
            if ((resultado.errors || resultado.errores) > 0) {
                console.log('🔍 Revisa los errores de validación arriba');
            }
            
            if ((resultado.duplicates || resultado.duplicados) > 0) {
                console.log('🔍 Todos los registros podrían ser duplicados');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

probarInsercionReal();