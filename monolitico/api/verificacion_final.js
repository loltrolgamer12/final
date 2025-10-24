require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificacionFinal() {
  console.log('✅ VERIFICACIÓN FINAL - ESTADO COMPLETO DE LA BASE DE DATOS\n');
  
  // 1. Conteo total
  const total = await prisma.inspeccionPesado.count();
  console.log(`📊 TOTAL DE REGISTROS: ${total}`);
  
  // 2. Distribución por fechas
  console.log('\n📅 DISTRIBUCIÓN POR PERÍODOS:');
  
  const julio = await prisma.inspeccionPesado.count({
    where: {
      fecha: {
        gte: new Date('2025-07-01'),
        lt: new Date('2025-08-01')
      }
    }
  });
  
  const octubre = await prisma.inspeccionPesado.count({
    where: {
      fecha: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    }
  });
  
  const otros = total - julio - octubre;
  
  console.log(`  Julio 2025: ${julio} registros`);
  console.log(`  Octubre 2025: ${octubre} registros`);
  console.log(`  Otros períodos: ${otros} registros`);
  
  // 3. Distribución de labrado GLOBAL
  console.log('\n🔧 DISTRIBUCIÓN GLOBAL DE LABRADO:');
  const distribuciones = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true
  });
  
  distribuciones.forEach(d => {
    const porcentaje = ((d._count / total) * 100).toFixed(1);
    console.log(`  llantas_labrado = ${d.llantas_labrado}: ${d._count} (${porcentaje}%)`);
  });
  
  // 4. Distribución de labrado por OCTUBRE (datos nuevos)
  console.log('\n📊 OCTUBRE 2025 (DATOS NUEVOS IMPORTADOS):');
  const octubreLabrado = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    }
  });
  
  octubreLabrado.forEach(d => {
    const porcentaje = ((d._count / octubre) * 100).toFixed(1);
    console.log(`  llantas_labrado = ${d.llantas_labrado}: ${d._count} (${porcentaje}%)`);
  });
  
  // 5. Distribución de labrado por JULIO (datos existentes)
  console.log('\n📊 JULIO 2025 (DATOS EXISTENTES):');
  const julioLabrado = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-07-01'),
        lt: new Date('2025-08-01')
      }
    }
  });
  
  julioLabrado.forEach(d => {
    const porcentaje = ((d._count / julio) * 100).toFixed(1);
    console.log(`  llantas_labrado = ${d.llantas_labrado}: ${d._count} (${porcentaje}%)`);
  });
  
  // 6. Últimos registros procesados
  console.log('\n🕐 ÚLTIMOS 10 REGISTROS PROCESADOS:');
  const ultimos = await prisma.inspeccionPesado.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      placa_vehiculo: true,
      fecha: true,
      llantas_labrado: true,
      createdAt: true
    }
  });
  
  ultimos.forEach((reg, i) => {
    console.log(`  ${i + 1}. ${reg.placa_vehiculo} - ${reg.fecha.toLocaleDateString()} - Labrado: ${reg.llantas_labrado}`);
  });
  
  // 7. Resumen final
  const falseCount = distribuciones.find(d => d.llantas_labrado === false)?._count || 0;
  const trueCount = distribuciones.find(d => d.llantas_labrado === true)?._count || 0;
  const octubreTrueCount = octubreLabrado.find(d => d.llantas_labrado === true)?._count || 0;
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 RESUMEN FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Datos nuevos importados: ${octubre} registros (Octubre 2025)`);
  console.log(`✅ Datos nuevos con labrado correcto: ${octubreTrueCount} registros`);
  console.log(`📊 Estado global: ${trueCount} true vs ${falseCount} false`);
  
  if (octubreTrueCount === octubre) {
    console.log('🎯 ¡PERFECTO! Todos los datos nuevos tienen labrado correcto');
  } else {
    console.log('⚠️  Algunos datos nuevos necesitan revisión');
  }
  
  await prisma.$disconnect();
  console.log('\n✅ Verificación completada!');
}

verificacionFinal().catch(console.error);