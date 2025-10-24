require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validarDatosExistentes() {
  console.log('🔍 VALIDANDO DATOS EXISTENTES (REGISTROS DE JULIO 2025)\n');
  
  // 1. Contar registros por período
  console.log('📊 ANÁLISIS DE REGISTROS POR FECHA:');
  
  const totalRegistros = await prisma.inspeccionPesado.count();
  console.log(`  Total general: ${totalRegistros} registros`);
  
  const registrosJulio = await prisma.inspeccionPesado.count({
    where: {
      fecha: {
        gte: new Date('2025-07-01'),
        lt: new Date('2025-08-01')
      }
    }
  });
  console.log(`  Julio 2025: ${registrosJulio} registros`);
  
  const registrosOctubre = await prisma.inspeccionPesado.count({
    where: {
      fecha: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    }
  });
  console.log(`  Octubre 2025: ${registrosOctubre} registros`);
  
  // 2. Analizar distribución de labrado por período
  console.log('\n📋 DISTRIBUCIÓN DE LABRADO POR PERÍODO:');
  
  // Julio 2025
  console.log('\n  JULIO 2025:');
  const labradoJulio = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-07-01'),
        lt: new Date('2025-08-01')
      }
    }
  });
  
  labradoJulio.forEach(l => {
    const porcentaje = ((l._count / registrosJulio) * 100).toFixed(1);
    console.log(`    llantas_labrado = ${l.llantas_labrado}: ${l._count} (${porcentaje}%)`);
  });
  
  // Octubre 2025
  console.log('\n  OCTUBRE 2025:');
  const labradoOctubre = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    }
  });
  
  labradoOctubre.forEach(l => {
    const porcentaje = ((l._count / registrosOctubre) * 100).toFixed(1);
    console.log(`    llantas_labrado = ${l.llantas_labrado}: ${l._count} (${porcentaje}%)`);
  });
  
  // 3. Muestra de registros de julio con labrado = false
  console.log('\n🔍 MUESTRA DE REGISTROS DE JULIO CON LABRADO = FALSE:');
  const muestraJulioFalse = await prisma.inspeccionPesado.findMany({
    where: {
      fecha: {
        gte: new Date('2025-07-01'),
        lt: new Date('2025-08-01')
      },
      llantas_labrado: false
    },
    take: 10,
    select: {
      placa_vehiculo: true,
      nombre_inspector: true,
      fecha: true,
      llantas_labrado: true,
      llantas_sin_cortes: true
    },
    orderBy: { fecha: 'desc' }
  });
  
  muestraJulioFalse.forEach((reg, i) => {
    console.log(`  ${i + 1}. ${reg.placa_vehiculo} - ${reg.nombre_inspector}`);
    console.log(`     Fecha: ${reg.fecha.toLocaleDateString()}`);
    console.log(`     Labrado: ${reg.llantas_labrado}, Sin cortes: ${reg.llantas_sin_cortes}`);
    console.log('');
  });
  
  // 4. Análisis de patrones sospechosos
  console.log('🚨 ANÁLISIS DE PATRONES SOSPECHOSOS:');
  
  const julioFalseCount = labradoJulio.find(l => l.llantas_labrado === false)?._count || 0;
  const julioTrueCount = labradoJulio.find(l => l.llantas_labrado === true)?._count || 0;
  
  if (julioFalseCount > julioTrueCount * 3) {
    console.log('  ⚠️  PROBLEMA DETECTADO en datos de JULIO:');
    console.log(`    - Demasiados registros con labrado = false (${julioFalseCount})`);
    console.log(`    - vs labrado = true (${julioTrueCount})`);
    console.log('    - Esto sugiere un problema en el procesamiento original');
  } else {
    console.log('  ✅ Los datos de julio parecen tener una distribución normal');
  }
  
  const octubreFalseCount = labradoOctubre.find(l => l.llantas_labrado === false)?._count || 0;
  const octubreTrueCount = labradoOctubre.find(l => l.llantas_labrado === true)?._count || 0;
  
  console.log(`\n  Comparación:
    Julio: ${julioFalseCount} false vs ${julioTrueCount} true
    Octubre: ${octubreFalseCount} false vs ${octubreTrueCount} true`);
  
  // 5. Sugerencia de corrección
  if (julioFalseCount > julioTrueCount * 2) {
    console.log('\n💡 RECOMENDACIÓN:');
    console.log('  Los datos de julio probablemente necesiten corrección.');
    console.log('  Si todos los vehículos realmente cumplían con el labrado,');
    console.log('  se puede ejecutar una corrección masiva.');
  }
  
  await prisma.$disconnect();
  console.log('\n✅ Validación completada!');
}

validarDatosExistentes().catch(console.error);