const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpiarBaseDatos() {
  try {
    console.log('🗑️  Iniciando limpieza de base de datos...');
    
    // Eliminar todos los registros de cada tabla
    const deletedRechazosPesado = await prisma.rechazoInspeccionPesado.deleteMany({});
    console.log(`✅ Eliminados ${deletedRechazosPesado.count} rechazos de inspecciones pesadas`);
    
    const deletedRechazosLigero = await prisma.rechazoInspeccion.deleteMany({});
    console.log(`✅ Eliminados ${deletedRechazosLigero.count} rechazos de inspecciones ligeras`);
    
    const deletedPesado = await prisma.inspeccionPesado.deleteMany({});
    console.log(`✅ Eliminados ${deletedPesado.count} inspecciones pesadas`);
    
    const deletedLigero = await prisma.inspeccion.deleteMany({});
    console.log(`✅ Eliminados ${deletedLigero.count} inspecciones ligeras`);
    
    console.log('🎉 Base de datos limpiada exitosamente');
    
  } catch (error) {
    console.error('❌ Error al limpiar base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarBaseDatos();
