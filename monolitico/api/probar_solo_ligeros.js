const path = require('path');
const { parseExcel } = require('./src/utils/excelParser');
const { processExcel } = require('./src/services/excelService');

async function probarArchivoLigero() {
    try {
        console.log('🧪 PROBANDO PROCESAMIENTO DE ARCHIVO LIGERO');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        // Leer archivo como buffer (como lo hace el endpoint real)
        console.log('\n1️⃣ LEYENDO ARCHIVO...');
        const fs = require('fs');
        const buffer = fs.readFileSync(archivoLigero);
        console.log(`📊 Buffer size: ${buffer.length} bytes`);
        
        // Parsear Excel con buffer
        console.log('\n2️⃣ PARSEANDO EXCEL...');
        const data = parseExcel(buffer);
        console.log(`📊 Filas leídas del Excel: ${data.length}`);
        
        if (data.length > 0) {
            console.log('\n📋 Primeras 3 filas del Excel:');
            data.slice(0, 3).forEach((row, i) => {
                console.log(`\nFila ${i + 1}:`);
                console.log(`  Fecha: ${row['Marca temporal'] || 'N/A'}`);
                console.log(`  Placa: ${row['PLACA DEL VEHICULO'] || row['PLACA DEL VEHÍCULO'] || 'N/A'}`);
                console.log(`  Conductor: ${row['NOMBRE DEL CONDUCTOR'] || 'N/A'}`);
                console.log(`  Inspector: ${row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN '] || row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] || 'N/A'}`);
                console.log(`  Fatiga libre: ${row['¿Se encuentra libre de síntomas de fatiga (Somnolencia, dolor de cabeza, irritabilidad)?'] || 'N/A'}`);
                console.log(`  Condiciones físicas: ${row['¿Se siente en condiciones físicas y mentales para conducir? '] || row['¿Se siente en condiciones físicas y mentales para conducir?'] || 'N/A'}`);
                console.log(`  Medicamentos: ${row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?*'] || row['¿Ha consumido medicamentos o sustancias que afecten su estado de alerta?'] || 'N/A'}`);
                console.log(`  Horas de sueño: ${row['¿Ha dormido al menos 7 horas en las últimas 24 horas?'] || 'N/A'}`);
            });
        }
        
        // Procesar con el servicio
        console.log('\n3️⃣ PROCESANDO CON EXCEL SERVICE...');
        const excelService = require('./src/services/excelService');
        const tipoVehiculo = 'ligero';
        const resultado = await excelService.processExcel(data, tipoVehiculo, true); // modo test
        
        console.log('\n📊 RESULTADO DEL PROCESAMIENTO:');
        console.log(`   ✅ Registros válidos: ${resultado.registrosValidos}`);
        console.log(`   ❌ Registros rechazados: ${resultado.registrosRechazados}`);
        console.log(`   🔄 Duplicados: ${resultado.duplicados}`);
        console.log(`   💾 Insertados: ${resultado.insertados}`);
        console.log(`   ⚠️ Errores: ${resultado.errores}`);
        
        if (resultado.registrosValidos > 0) {
            console.log('\n✅ PROCESAMIENTO EXITOSO');
        } else {
            console.log('\n❌ PROBLEMA EN EL PROCESAMIENTO');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

probarArchivoLigero();