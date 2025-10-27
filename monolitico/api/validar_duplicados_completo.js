require('dotenv').config();
const prisma = require('./src/config/database');

async function validarDuplicados() {
    try {
        console.log('🔍 VALIDANDO DETECCIÓN DE DUPLICADOS');
        console.log('================================================================================');
        
        console.log('\n1️⃣ VERIFICANDO REGISTROS EN BASE DE DATOS:');
        
        // Contar registros ligeros
        const countLigeros = await prisma.inspeccion.count();
        console.log(`📊 Total registros ligeros en BD: ${countLigeros}`);
        
        // Contar registros pesados
        const countPesados = await prisma.inspeccionPesado.count();
        console.log(`📊 Total registros pesados en BD: ${countPesados}`);
        
        // Verificar archivos procesados
        const archivos = await prisma.archivoProcesado.findMany({
            select: {
                nombre_archivo: true,
                total_registros: true,
                registros_insertados: true,
                registros_duplicados: true,
                fecha_procesamiento: true
            },
            orderBy: { fecha_procesamiento: 'desc' },
            take: 10
        });
        
        console.log('\n2️⃣ ÚLTIMOS ARCHIVOS PROCESADOS:');
        archivos.forEach((archivo, index) => {
            console.log(`   ${index + 1}. ${archivo.nombre_archivo}`);
            console.log(`      Total: ${archivo.total_registros} | Insertados: ${archivo.registros_insertados} | Duplicados: ${archivo.registros_duplicados}`);
            console.log(`      Fecha: ${archivo.fecha_procesamiento}`);
        });
        
        console.log('\n3️⃣ VERIFICANDO MUESTRAS DE REGISTROS:');
        
        // Muestra de registros ligeros
        const muestraLigeros = await prisma.inspeccion.findMany({
            select: {
                placa_vehiculo: true,
                fecha: true,
                conductor_nombre: true
            },
            take: 5,
            orderBy: { fecha: 'desc' }
        });
        
        console.log('\n📋 MUESTRA REGISTROS LIGEROS (últimos 5):');
        muestraLigeros.forEach((reg, index) => {
            console.log(`   ${index + 1}. Placa: ${reg.placa_vehiculo} | Conductor: ${reg.conductor_nombre} | Fecha: ${reg.fecha}`);
        });
        
        // Muestra de registros pesados
        const muestraPesados = await prisma.inspeccionPesado.findMany({
            select: {
                placa_vehiculo: true,
                fecha: true,
                nombre_inspector: true
            },
            take: 5,
            orderBy: { fecha: 'desc' }
        });
        
        console.log('\n🚛 MUESTRA REGISTROS PESADOS (últimos 5):');
        muestraPesados.forEach((reg, index) => {
            console.log(`   ${index + 1}. Placa: ${reg.placa_vehiculo} | Inspector: ${reg.nombre_inspector} | Fecha: ${reg.fecha}`);
        });
        
        console.log('\n4️⃣ ANÁLISIS DE DUPLICADOS:');
        
        // Verificar si hay duplicados reales en ligeros
        const duplicadosLigeros = await prisma.$queryRaw`
            SELECT placa_vehiculo, fecha, conductor_nombre, COUNT(*) as total
            FROM "Inspeccion"
            GROUP BY placa_vehiculo, fecha, conductor_nombre
            HAVING COUNT(*) > 1
            LIMIT 5
        `;
        
        console.log(`📊 Duplicados reales en ligeros: ${duplicadosLigeros.length} grupos encontrados`);
        if (duplicadosLigeros.length > 0) {
            duplicadosLigeros.forEach((dup, index) => {
                console.log(`   ${index + 1}. Placa: ${dup.placa_vehiculo} | Conductor: ${dup.conductor_nombre} | Repeticiones: ${dup.total}`);
            });
        }
        
        // Verificar si hay duplicados reales en pesados
        const duplicadosPesados = await prisma.$queryRaw`
            SELECT placa_vehiculo, fecha, nombre_inspector, COUNT(*) as total
            FROM "InspeccionPesado"
            GROUP BY placa_vehiculo, fecha, nombre_inspector
            HAVING COUNT(*) > 1
            LIMIT 5
        `;
        
        console.log(`📊 Duplicados reales en pesados: ${duplicadosPesados.length} grupos encontrados`);
        if (duplicadosPesados.length > 0) {
            duplicadosPesados.forEach((dup, index) => {
                console.log(`   ${index + 1}. Placa: ${dup.placa_vehiculo} | Inspector: ${dup.nombre_inspector} | Repeticiones: ${dup.total}`);
            });
        }
        
        console.log('\n5️⃣ CONCLUSIONES:');
        if (countLigeros === 4996 && countPesados === 3521) {
            console.log('✅ Los números coinciden - probablemente son duplicados reales');
        } else {
            console.log('⚠️ Los números NO coinciden - puede haber un problema en la detección');
        }
        
        if (duplicadosLigeros.length === 0 && duplicadosPesados.length === 0) {
            console.log('🔍 No se encontraron duplicados reales - el sistema funciona correctamente');
        } else {
            console.log('⚠️ Se encontraron duplicados reales en la base de datos');
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

validarDuplicados();