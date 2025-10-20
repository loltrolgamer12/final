const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function vaciarArchivoProcesados() {
  console.log('🗑️  VACIANDO TABLA DE ARCHIVOS PROCESADOS...\n');
  
  try {
    const count = await prisma.archivoProcesado.count();
    console.log(`📊 Archivos procesados actuales: ${count}\n`);
    
    console.log('🔄 Eliminando registros...');
    const deleted = await prisma.archivoProcesado.deleteMany({});
    console.log(`✅ Eliminados ${deleted.count} archivos procesados\n`);
    
    const final = await prisma.archivoProcesado.count();
    console.log(`✅ Tabla vaciada: ${final} registros restantes\n`);
    
    console.log('🎉 ¡Listo! Ahora puedes volver a subir cualquier archivo Excel sin restricciones.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

vaciarArchivoProcesados();
