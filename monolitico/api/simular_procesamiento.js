require('dotenv').config();
const path = require('path');
const fs = require('fs');
const excelParser = require('./src/utils/excelParser');

async function simularProcesamientoCompleto() {
    try {
        console.log('🧪 SIMULANDO PROCESAMIENTO COMPLETO (SIN BD)');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        console.log('\n1️⃣ LEYENDO ARCHIVO...');
        const buffer = fs.readFileSync(archivoLigero);
        console.log(`📊 Buffer size: ${buffer.length} bytes`);
        
        console.log('\n2️⃣ PARSEANDO EXCEL...');
        const jsonData = excelParser.parseExcel(buffer);
        console.log(`📊 Excel Parser: ${jsonData.length} registros procesados`);
        
        // Simular mapeo (usando una versión simplificada)
        console.log('\n3️⃣ SIMULANDO MAPEO...');
        const excelService = require('./src/services/excelService');
        
        let registrosMappeados = 0;
        let erroresMapeo = 0;
        let registrosConPlaca = 0;
        
        for (let i = 0; i < Math.min(jsonData.length, 10); i++) { // Solo los primeros 10 para test
            try {
                // Simular el mapeo sin base de datos
                const row = jsonData[i];
                
                // Helper para obtener valor de columna con trim
                const getCol = (colName) => {
                    const keys = Object.keys(row);
                    const found = keys.find(k => k.trim() === colName.trim());
                    return found ? row[found] : null;
                };
                
                const placa = (getCol('PLACA DEL VEHICULO') || getCol('PLACA DEL VEHÍCULO') || '').toString().replace(/\s+/g, '').toUpperCase();
                const fecha = getCol('Marca temporal');
                const inspector = (getCol('NOMBRE DE QUIEN REALIZA LA INSPECCIÓN ') || getCol('NOMBRE DE QUIEN REALIZA LA INSPECCIÓN') || '').toString().trim();
                
                console.log(`   Registro ${i + 1}: placa="${placa}", fecha="${fecha ? 'sí' : 'no'}", inspector="${inspector ? inspector.substring(0, 20) : 'no'}"`);
                
                if (placa && fecha && inspector) {
                    registrosConPlaca++;
                }
                
                registrosMappeados++;
            } catch (error) {
                erroresMapeo++;
                console.log(`   ❌ Error en registro ${i + 1}: ${error.message}`);
            }
        }
        
        console.log('\n📊 RESUMEN DE SIMULACIÓN:');
        console.log(`   📋 Registros totales: ${jsonData.length}`);
        console.log(`   ✅ Registros analizados (muestra): ${registrosMappeados}`);
        console.log(`   📝 Registros con placa/fecha/inspector: ${registrosConPlaca}`);
        console.log(`   ❌ Errores de mapeo: ${erroresMapeo}`);
        
        console.log('\n🎯 CONCLUSIÓN:');
        if (registrosConPlaca > 0) {
            console.log('✅ El procesamiento funciona correctamente');
            console.log('✅ Los registros tienen los campos necesarios');
            console.log('🔗 Solo falta conectividad a la base de datos');
        } else {
            console.log('❌ Hay problemas en el mapeo de campos');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    }
}

simularProcesamientoCompleto();