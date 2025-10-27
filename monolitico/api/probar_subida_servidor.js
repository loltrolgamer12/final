const fs = require('fs');
const path = require('path');

async function probarSubidaLigero() {
    try {
        console.log('🧪 PROBANDO SUBIDA DE ARCHIVO LIGERO AL SERVIDOR');
        console.log('================================================================================');
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        console.log(`📁 Archivo: ${archivoLigero}`);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(archivoLigero)) {
            console.log('❌ El archivo no existe');
            return;
        }
        
        console.log('✅ Archivo encontrado');
        const stats = fs.statSync(archivoLigero);
        console.log(`📊 Tamaño: ${stats.size} bytes`);
        
        // Crear FormData para la subida
        const FormData = require('form-data');
        const form = new FormData();
        
        // Leer el archivo y agregarlo al form
        const fileStream = fs.createReadStream(archivoLigero);
        form.append('file', fileStream, {
            filename: 'HQ-FO-40_ligero_test.xlsx',
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        // Agregar el tipo de archivo
        form.append('tipo', 'ligero');
        
        console.log('\n🚀 ENVIANDO ARCHIVO AL SERVIDOR...');
        
        // Hacer la petición HTTP usando axios en su lugar
        const axios = require('axios');
        
        console.log('\n🚀 ENVIANDO ARCHIVO AL SERVIDOR...');
        
        const response = await axios.post('http://localhost:4000/api/upload', form, {
            headers: {
                ...form.getHeaders(),
                'Content-Type': 'multipart/form-data'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        
        const resultado = response.data;
        
        console.log('\n📊 RESPUESTA DEL SERVIDOR:');
        console.log(JSON.stringify(resultado, null, 2));
        
        if (response.status === 200 && resultado.success) {
            console.log('\n✅ ¡SUBIDA EXITOSA!');
            console.log(`💾 Registros insertados: ${resultado.insertados || resultado.data?.insertados || 'N/A'}`);
            console.log(`📋 Registros válidos: ${resultado.validRecords || resultado.data?.validRecords || 'N/A'}`);
            console.log(`🔄 Duplicados: ${resultado.duplicates || resultado.data?.duplicates || 'N/A'}`);
            console.log(`❌ Errores: ${resultado.errors || resultado.data?.errors || 'N/A'}`);
        } else {
            console.log('\n❌ ERROR EN LA SUBIDA');
            console.log(`💥 Mensaje: ${resultado.message || resultado.error || 'Error desconocido'}`);
        }
        
    } catch (error) {
        console.error('💥 Error en la prueba:', error.message);
        
        if (error.response) {
            console.log('\n📡 RESPUESTA DEL SERVIDOR CON ERROR:');
            console.log(`📡 Status: ${error.response.status} ${error.response.statusText}`);
            console.log('📄 Datos:', JSON.stringify(error.response.data, null, 2));
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n🔌 El servidor no está corriendo en localhost:4000');
            console.log('   Asegúrate de que el servidor esté iniciado');
        }
    }
}

probarSubidaLigero();