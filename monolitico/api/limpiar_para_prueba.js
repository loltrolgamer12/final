require('dotenv').config();
const prisma = require('./src/config/database');

async function limpiarYProbar() {
    try {
        console.log('🧹 LIMPIANDO REGISTROS PARA PRUEBA DE INSERCIÓN');
        console.log('================================================================================');
        
        console.log('\n1️⃣ ESTADO ANTES DE LIMPIAR:');
        const countLigerosBefore = await prisma.inspeccion.count();
        const countPesadosBefore = await prisma.inspeccionPesado.count();
        const countArchivosBefore = await prisma.archivoProcesado.count();
        
        console.log(`📊 Ligeros: ${countLigerosBefore}`);
        console.log(`📊 Pesados: ${countPesadosBefore}`);
        console.log(`📊 Archivos procesados: ${countArchivosBefore}`);
        
        console.log('\n2️⃣ LIMPIANDO ALGUNOS REGISTROS PARA PRUEBA...');
        
        // Eliminar los últimos 100 registros ligeros para probar inserción
        const ultimosLigeros = await prisma.inspeccion.findMany({
            orderBy: { fecha: 'desc' },
            take: 100,
            select: { id: true }
        });
        
        if (ultimosLigeros.length > 0) {
            const ids = ultimosLigeros.map(r => r.id);
            await prisma.inspeccion.deleteMany({
                where: { id: { in: ids } }
            });
            console.log(`✅ Eliminados ${ultimosLigeros.length} registros ligeros para prueba`);
        }
        
        // Eliminar los últimos 50 registros pesados para probar inserción
        const ultimosPesados = await prisma.inspeccionPesado.findMany({
            orderBy: { fecha: 'desc' },
            take: 50,
            select: { id: true }
        });
        
        if (ultimosPesados.length > 0) {
            const ids = ultimosPesados.map(r => r.id);
            await prisma.inspeccionPesado.deleteMany({
                where: { id: { in: ids } }
            });
            console.log(`✅ Eliminados ${ultimosPesados.length} registros pesados para prueba`);
        }
        
        // Eliminar registros de archivos procesados para permitir re-subida
        await prisma.archivoProcesado.deleteMany({
            where: {
                nombre_archivo: {
                    contains: 'test'
                }
            }
        });
        console.log('✅ Eliminados registros de archivos de prueba');
        
        console.log('\n3️⃣ ESTADO DESPUÉS DE LIMPIAR:');
        const countLigerosAfter = await prisma.inspeccion.count();
        const countPesadosAfter = await prisma.inspeccionPesado.count();
        const countArchivosAfter = await prisma.archivoProcesado.count();
        
        console.log(`📊 Ligeros: ${countLigerosAfter} (eliminados: ${countLigerosBefore - countLigerosAfter})`);
        console.log(`📊 Pesados: ${countPesadosAfter} (eliminados: ${countPesadosBefore - countPesadosAfter})`);
        console.log(`📊 Archivos procesados: ${countArchivosAfter}`);
        
        console.log('\n✅ Base de datos limpia para pruebas. Ahora puedes probar la inserción de registros nuevos.');
        
    } catch (error) {
        console.error('💥 Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

limpiarYProbar();