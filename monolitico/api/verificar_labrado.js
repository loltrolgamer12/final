const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarLabrado() {
  console.log('🔍 VERIFICANDO PROBLEMA DE LABRADO DE NEUMÁTICOS...\n');
  
  // Tomar una muestra de inspecciones pesadas
  const inspecciones = await prisma.inspeccionPesado.findMany({
    take: 20,
    select: {
      id: true,
      placa_vehiculo: true,
      llantas_labrado: true,
      llantas_sin_cortes: true,
      fecha: true,
      nombre_inspector: true
    },
    orderBy: {
      fecha: 'desc'
    }
  });
  
  console.log('=== MUESTRA DE 20 INSPECCIONES PESADAS ===\n');
  inspecciones.forEach((i, idx) => {
    console.log(`${idx + 1}. Placa: ${i.placa_vehiculo || 'N/A'}`);
    console.log(`   Labrado: ${i.llantas_labrado}`);
    console.log(`   Sin cortes: ${i.llantas_sin_cortes}`);
    console.log(`   Fecha: ${i.fecha}`);
    console.log('');
  });
  
  // Estadísticas generales
  const total = await prisma.inspeccionPesado.count();
  const conLabradoFalse = await prisma.inspeccionPesado.count({
    where: { llantas_labrado: false }
  });
  const conLabradoTrue = await prisma.inspeccionPesado.count({
    where: { llantas_labrado: true }
  });
  const conLabradoNull = await prisma.inspeccionPesado.count({
    where: { llantas_labrado: null }
  });
  
  console.log('\n=== ESTADÍSTICAS GENERALES ===');
  console.log(`Total inspecciones pesadas: ${total}`);
  console.log(`Con labrado FALSE (problema): ${conLabradoFalse} (${(conLabradoFalse/total*100).toFixed(1)}%)`);
  console.log(`Con labrado TRUE (OK): ${conLabradoTrue} (${(conLabradoTrue/total*100).toFixed(1)}%)`);
  console.log(`Con labrado NULL: ${conLabradoNull} (${(conLabradoNull/total*100).toFixed(1)}%)`);
  
  // Verificar si todas tienen el mismo problema
  if (conLabradoFalse === total) {
    console.log('\n⚠️  ¡PROBLEMA DETECTADO!');
    console.log('TODAS las inspecciones tienen llantas_labrado = FALSE');
    console.log('Esto indica un problema en el mapeo del Excel.');
  } else if (conLabradoTrue === total) {
    console.log('\n⚠️  ¡PROBLEMA DETECTADO!');
    console.log('TODAS las inspecciones tienen llantas_labrado = TRUE');
    console.log('Esto indica un problema en el mapeo del Excel.');
  }
  
  await prisma.$disconnect();
}

verificarLabrado().catch(console.error);
