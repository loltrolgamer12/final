require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function probarConArchivoNuevo() {
    try {
        console.log('🧪 PROBANDO CON ARCHIVO MODIFICADO (SIN DUPLICADOS)');
        console.log('================================================================================');
        
        // Crear FormData para la subida
        const FormData = require('form-data');
        const form = new FormData();
        
        const archivoLigero = path.join(__dirname, '..', '..', 'pruebas', 'HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. (respuestas) 84545.xlsx');
        const fileStream = fs.createReadStream(archivoLigero);
        
        // Usar un nombre diferente para evitar la detección de archivo duplicado
        form.append('file', fileStream, {
            filename: 'HQ-FO-40_NUEVO_TEST_' + Date.now() + '.xlsx',
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        form.append('tipo', 'ligero');
        
        console.log('\n🚀 ENVIANDO ARCHIVO CON NOMBRE ÚNICO...');
        
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
        
        console.log('\n📊 RESULTADO:');
        console.log(JSON.stringify(resultado, null, 2));
        
        if (resultado.success) {
            console.log('\n🔍 ANÁLISIS:');
            const data = resultado.data;
            
            if (data.registrosInsertados > 0) {
                console.log('✅ ¡EL SISTEMA SÍ INSERTA REGISTROS NUEVOS!');
                console.log(`💾 Se insertaron: ${data.registrosInsertados} registros`);
            } else if (data.registrosDuplicados === data.totalRegistros) {
                console.log('✅ TODOS SON DUPLICADOS - Sistema funcionando correctamente');
                console.log('   Los datos ya estaban en la base de datos');
            }
            
            console.log(`📊 Total procesados: ${data.totalRegistros}`);
            console.log(`🔄 Duplicados: ${data.registrosDuplicados}`);
            console.log(`❌ Errores: ${data.registrosError}`);
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
        
        if (error.response) {
            console.log('\n📄 Respuesta del servidor:');
            console.log(JSON.stringify(error.response.data, null, 2));
        }
    }
}

probarConArchivoNuevo();