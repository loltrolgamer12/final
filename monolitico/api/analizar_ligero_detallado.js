const XLSX = require('xlsx');
const path = require('path');

function analizarArchivoLigero() {
    try {
        console.log('🔍 ANÁLISIS DETALLADO DEL ARCHIVO LIGERO');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        // Leer el archivo Excel
        const workbook = XLSX.readFile(archivoLigero);
        console.log(`📊 Hojas en el archivo: ${workbook.SheetNames.join(', ')}`);
        
        // Analizar la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log(`\n📋 Analizando hoja: ${sheetName}`);
        
        // Obtener el rango de datos
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        console.log(`📏 Rango: ${XLSX.utils.encode_range(range)} (${range.e.r + 1} filas, ${range.e.c + 1} columnas)`);
        
        // Leer las primeras 5 filas como están
        console.log('\n🔍 PRIMERAS 5 FILAS DEL EXCEL:');
        for (let row = 0; row <= Math.min(4, range.e.r); row++) {
            console.log(`\nFila ${row + 1}:`);
            for (let col = 0; col <= Math.min(10, range.e.c); col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];
                const value = cell ? cell.v : '';
                if (value) {
                    console.log(`  Col ${col}: ${value}`);
                }
            }
        }
        
        // Probar diferentes formas de leer headers
        console.log('\n🔍 DIFERENTES MÉTODOS DE LECTURA:');
        
        // Método 1: Primera fila como headers
        console.log('\n1️⃣ Primera fila como headers:');
        const data1 = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (data1.length > 0) {
            console.log(`Headers encontrados: ${data1[0].length}`);
            console.log('Primeros 10 headers:', data1[0].slice(0, 10));
        }
        
        // Método 2: Auto-detect headers
        console.log('\n2️⃣ Auto-detect headers:');
        const data2 = XLSX.utils.sheet_to_json(worksheet);
        if (data2.length > 0) {
            const headers = Object.keys(data2[0]);
            console.log(`Headers encontrados: ${headers.length}`);
            console.log('Primeros 10 headers:', headers.slice(0, 10));
            
            // Buscar campos de fatiga
            const fatigaHeaders = headers.filter(h => 
                h.toLowerCase().includes('fatiga') ||
                h.toLowerCase().includes('dormido') ||
                h.toLowerCase().includes('condiciones') ||
                h.toLowerCase().includes('medicamentos')
            );
            console.log('🧠 Headers relacionados con fatiga:', fatigaHeaders);
        }
        
        // Método 3: Range específico
        console.log('\n3️⃣ Leer desde fila 2:');
        const data3 = XLSX.utils.sheet_to_json(worksheet, { range: 1 });
        console.log(`Registros desde fila 2: ${data3.length}`);
        
        if (data3.length > 0) {
            console.log('\n📋 Primer registro completo:');
            const firstRecord = data3[0];
            Object.keys(firstRecord).forEach(key => {
                if (firstRecord[key]) {
                    console.log(`  ${key}: ${firstRecord[key]}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error analizando archivo:', error.message);
    }
}

analizarArchivoLigero();