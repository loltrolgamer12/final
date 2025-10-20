const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function vaciarTablasPesados() {
  console.log('🗑️  VACIANDO TABLAS DE VEHÍCULOS PESADOS...\n');
  
  try {
    // Contar registros antes
    const countInspecciones = await prisma.inspeccionPesado.count();
    const countRechazos = await prisma.rechazoInspeccionPesado.count();
    
    console.log('📊 Registros actuales:');
    console.log(`  - InspeccionPesado: ${countInspecciones}`);
    console.log(`  - RechazoInspeccionPesado: ${countRechazos}\n`);
    
    // Vaciar tabla de rechazos primero (puede tener referencias)
    console.log('🔄 Eliminando rechazos de inspecciones pesadas...');
    const deletedRechazos = await prisma.rechazoInspeccionPesado.deleteMany({});
    console.log(`✅ Eliminados ${deletedRechazos.count} rechazos\n`);
    
    // Vaciar tabla de inspecciones
    console.log('🔄 Eliminando inspecciones pesadas...');
    const deletedInspecciones = await prisma.inspeccionPesado.deleteMany({});
    console.log(`✅ Eliminados ${deletedInspecciones.count} inspecciones\n`);
    
    // Verificar que están vacías
    const finalInspecciones = await prisma.inspeccionPesado.count();
    const finalRechazos = await prisma.rechazoInspeccionPesado.count();
    
    console.log('✅ TABLAS VACIADAS:');
    console.log(`  - InspeccionPesado: ${finalInspecciones} registros`);
    console.log(`  - RechazoInspeccionPesado: ${finalRechazos} registros\n`);
    
    console.log('🎉 ¡Listo! Ahora puedes volver a subir el archivo Excel de vehículos pesados.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

vaciarTablasPesados();
