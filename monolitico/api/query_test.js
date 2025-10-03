require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sample = await prisma.inspeccion.findMany({ 
    take: 5, 
    select: { 
      id: true, 
      nivel_riesgo: true,
      consumo_medicamentos: true,
      horas_sueno_suficientes: true,
      libre_sintomas_fatiga: true,
      condiciones_aptas: true
    }
  });
  console.log(JSON.stringify(sample, null, 2));
  
  const stats = await prisma.inspeccion.groupBy({
    by: ['nivel_riesgo'],
    _count: true
  });
  console.log('\nDistribución de nivel_riesgo:');
  console.log(JSON.stringify(stats, null, 2));
}

main().finally(() => prisma.$disconnect());
