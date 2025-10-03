require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corregirCamposNull() {
  console.log('🔄 Recalculando nivel de riesgo con nueva lógica...\n');
  
  const inspecciones = await prisma.inspeccion.findMany({
    select: {
      id: true,
      // Componentes críticos
      frenos: true,
      frenos_emergencia: true,
      cinturones: true,
      freno: true, // luces de freno
      // Componentes semi-críticos
      direccionales: true,
      espejos: true,
      vidrio_frontal: true,
      reversa: true,
      altas_bajas: true,
      // Condiciones del conductor
      consumo_medicamentos: true,
      horas_sueno_suficientes: true,
      libre_sintomas_fatiga: true
    }
  });
  
  let actualizadas = 0;
  
  for (const insp of inspecciones) {
    // === RIESGO DEL VEHÍCULO ===
    const componentesCriticos = [
      insp.frenos,
      insp.frenos_emergencia,
      insp.cinturones,
      insp.freno  // luces de freno
    ];
    
    const componentesSemiCriticos = [
      insp.direccionales,
      insp.espejos,
      insp.vidrio_frontal,
      insp.reversa,
      insp.altas_bajas
    ];
    
    const fallasCriticasVehiculo = componentesCriticos.filter(c => c === false).length;
    const fallasSemiCriticasVehiculo = componentesSemiCriticos.filter(c => c === false).length;
    
    let riesgoVehiculo = 'BAJO';
    if (fallasCriticasVehiculo > 0) riesgoVehiculo = 'ALTO';
    else if (fallasSemiCriticasVehiculo >= 2) riesgoVehiculo = 'MEDIO';
    
    // === RIESGO DEL CONDUCTOR ===
    let riesgoConductor = 'BAJO';
    if (insp.consumo_medicamentos === true ||
        insp.horas_sueno_suficientes === false ||
        insp.libre_sintomas_fatiga === false) {
      riesgoConductor = 'ALTO';
    }
    
    // === RIESGO GENERAL: El más alto de los dos ===
    let nuevoRiesgo = 'BAJO';
    if (riesgoVehiculo === 'ALTO' || riesgoConductor === 'ALTO') {
      nuevoRiesgo = 'ALTO';
    } else if (riesgoVehiculo === 'MEDIO' || riesgoConductor === 'MEDIO') {
      nuevoRiesgo = 'MEDIO';
    }
    
    await prisma.inspeccion.update({
      where: { id: insp.id },
      data: { nivel_riesgo: nuevoRiesgo }
    });
    
    actualizadas++;
    if (actualizadas % 100 === 0) {
      process.stdout.write(`\r✅ Actualizadas: ${actualizadas}/${inspecciones.length}`);
    }
  }
  
  console.log(`\n✅ Recalculadas ${actualizadas} inspecciones`);
  
  // Verificar nueva distribución
  const bajo = await prisma.inspeccion.count({ where: { nivel_riesgo: 'BAJO' } });
  const medio = await prisma.inspeccion.count({ where: { nivel_riesgo: 'MEDIO' } });
  const alto = await prisma.inspeccion.count({ where: { nivel_riesgo: 'ALTO' } });
  
  console.log(`\n📊 Nueva distribución de riesgo:`);
  console.log(`   BAJO: ${bajo}`);
  console.log(`   MEDIO: ${medio}`);
  console.log(`   ALTO: ${alto}`);
  console.log(`   TOTAL: ${bajo + medio + alto}`);
  
  console.log('\n✅ Corrección completada exitosamente!');
}

corregirCamposNull()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
