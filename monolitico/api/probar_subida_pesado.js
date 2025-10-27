const fs = require('fs');
const path = require('path');

async function probarSubidaPesado() {
    try {
        console.log('🚛 PROBANDO SUBIDA DE ARCHIVO PESADO AL SERVIDOR');
        console.log('================================================================================');
        
        const archivoPesado = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (13).xlsx');
        console.log(`📁 Archivo: ${archivoPesado}`);
        
        // Verificar que el archivo existe
        if (!fs.existsSync(archivoPesado)) {
            console.log('❌ El archivo no existe');
            return;
        }
        
        console.log('✅ Archivo encontrado');
        const stats = fs.statSync(archivoPesado);
        console.log(`📊 Tamaño: ${stats.size} bytes`);
        
        // Crear FormData para la subida
        const FormData = require('form-data');
        const form = new FormData();
        
        // Leer el archivo y agregarlo al form
        const fileStream = fs.createReadStream(archivoPesado);
        form.append('file', fileStream, {
            filename: 'HQ-FO-41_pesado_test.xlsx',
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        // Especificar que es tipo PESADO
        form.append('tipo', 'pesado');
        
        console.log('\n🚀 ENVIANDO ARCHIVO PESADO AL SERVIDOR...');
        
        // Hacer la petición HTTP usando axios
        const axios = require('axios');
        
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
            console.log(`💾 Registros insertados: ${resultado.data?.registrosInsertados || 'N/A'}`);
            console.log(`📋 Registros totales: ${resultado.data?.totalRegistros || 'N/A'}`);
            console.log(`🔄 Duplicados: ${resultado.data?.registrosDuplicados || 'N/A'}`);
            console.log(`❌ Errores: ${resultado.data?.registrosError || 'N/A'}`);
            console.log(`📁 Hash del archivo: ${resultado.data?.fileHash || 'N/A'}`);
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

probarSubidaPesado();