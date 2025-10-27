require('dotenv').config();

async function probarConexionBD() {
    console.log('🔍 DIAGNÓSTICO DE CONEXIÓN A BASE DE DATOS');
    console.log('================================================================================');
    
    // 1. Verificar variables de entorno
    console.log('\n1️⃣ VARIABLES DE ENTORNO:');
    console.log(`DATABASE_URL configurada: ${process.env.DATABASE_URL ? 'SÍ' : 'NO'}`);
    if (process.env.DATABASE_URL) {
        const url = process.env.DATABASE_URL;
        console.log(`URL empieza con postgresql://: ${url.startsWith('postgresql://') ? 'SÍ' : 'NO'}`);
        console.log(`Longitud URL: ${url.length} caracteres`);
        
        // Extraer componentes de la URL (sin mostrar la contraseña completa)
        try {
            const urlObj = new URL(url);
            console.log(`Host: ${urlObj.hostname}`);
            console.log(`Puerto: ${urlObj.port || '5432'}`);
            console.log(`Base de datos: ${urlObj.pathname.slice(1)}`);
            console.log(`Usuario: ${urlObj.username}`);
            console.log(`SSL: ${urlObj.searchParams.get('sslmode') || 'no especificado'}`);
        } catch (error) {
            console.log(`❌ Error parseando URL: ${error.message}`);
        }
    }
    
    // 2. Probar conexión con Prisma
    console.log('\n2️⃣ PROBANDO CONEXIÓN CON PRISMA:');
    try {
        const prisma = require('./src/config/database');
        console.log('✅ Prisma client importado correctamente');
        
        // Intentar una consulta simple
        console.log('🔄 Intentando conectar...');
        await prisma.$connect();
        console.log('✅ Conexión establecida con $connect()');
        
        // Probar una consulta muy simple
        console.log('🔄 Probando consulta simple...');
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Consulta exitosa:', result);
        
        await prisma.$disconnect();
        console.log('✅ Desconexión exitosa');
        
    } catch (error) {
        console.log('❌ Error de conexión Prisma:');
        console.log(`   Código: ${error.code || 'N/A'}`);
        console.log(`   Mensaje: ${error.message}`);
        
        if (error.message.includes("Can't reach database server")) {
            console.log('\n🔍 POSIBLES CAUSAS:');
            console.log('   • Servidor de BD no disponible');
            console.log('   • Firewall bloqueando conexión');
            console.log('   • Credenciales incorrectas');
            console.log('   • URL malformada');
        }
    }
    
    // 3. Probar conectividad de red básica
    console.log('\n3️⃣ PROBANDO CONECTIVIDAD DE RED:');
    try {
        const { execSync } = require('child_process');
        const host = 'ep-twilight-bread-adyttecf-pooler.us-east-1.postgres.neon.tech';
        
        console.log(`🔄 Probando ping a ${host}...`);
        const pingResult = execSync(`ping -n 2 ${host}`, { encoding: 'utf8', timeout: 10000 });
        console.log('✅ Ping exitoso - el host es alcanzable');
        
    } catch (error) {
        console.log('❌ Error de ping:');
        console.log(`   ${error.message}`);
        console.log('\n🔍 Esto puede indicar:');
        console.log('   • Problemas de conectividad de red');
        console.log('   • Firewall corporativo');
        console.log('   • DNS no resuelve el host');
    }
    
    // 4. Verificar Prisma schema
    console.log('\n4️⃣ VERIFICANDO CONFIGURACIÓN PRISMA:');
    try {
        const fs = require('fs');
        const schemaPath = './prisma/schema.prisma';
        if (fs.existsSync(schemaPath)) {
            console.log('✅ schema.prisma encontrado');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const dbConfig = schema.match(/datasource\s+db\s*{[\s\S]*?}/);
            if (dbConfig) {
                console.log('✅ Configuración de datasource encontrada');
                console.log(dbConfig[0]);
            }
        } else {
            console.log('❌ schema.prisma no encontrado');
        }
    } catch (error) {
        console.log(`❌ Error verificando schema: ${error.message}`);
    }
}

probarConexionBD();