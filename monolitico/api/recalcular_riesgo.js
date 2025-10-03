require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calcularRiesgo(inspeccion) {
  // Lógica CORREGIDA: solo marcar ALTO si hay respuestas explícitamente negativas
  if (inspeccion.consumo_medicamentos === true ||
      inspeccion.horas_sueno_suficientes === false ||
      inspeccion.libre_sintomas_fatiga === false) {
    return 'ALTO';
  }
  
  // MEDIO: No se siente apto para conducir
  if (inspeccion.condiciones_aptas === false) {
    return 'MEDIO';
  }
  
  // BAJO: Todo bien o no respondió preguntas de fatiga (campos null)
  return 'BAJO';
}

function calcularPuntajeFatiga(inspeccion) {
  let puntaje = 0;
  if (inspeccion.horas_sueno_suficientes === true) puntaje++;
  if (inspeccion.libre_sintomas_fatiga === true) puntaje++;
  if (inspeccion.condiciones_aptas === true) puntaje++;
  if (inspeccion.consumo_medicamentos !== true) puntaje++;
  return puntaje;
}

function tieneAlertasCriticas(inspeccion, nuevoRiesgo) {
  const puntajeFatiga = calcularPuntajeFatiga(inspeccion);
  return nuevoRiesgo === 'ALTO' || puntajeFatiga < 2;
}

async function recalcular() {
  console.log('🔄 Recalculando nivel de riesgo para todas las inspecciones...\n');
  
  // Obtener todas las inspecciones ligeras
  const inspecciones = await prisma.inspeccion.findMany({
    select: {
      id: true,
      nivel_riesgo: true,
      consumo_medicamentos: true,
      horas_sueno_suficientes: true,
      libre_sintomas_fatiga: true,
      condiciones_aptas: true,
      puntaje_fatiga: true,
      tiene_alertas_criticas: true
    }
  });
  
  console.log(`📊 Total de inspecciones a procesar: ${inspecciones.length}`);
  
  let actualizadas = 0;
  let sinCambios = 0;
  const cambios = { 'ALTO→BAJO': 0, 'ALTO→MEDIO': 0, 'BAJO→ALTO': 0, 'MEDIO→ALTO': 0 };
  
  for (const insp of inspecciones) {
    const nuevoRiesgo = calcularRiesgo(insp);
    const nuevoPuntajeFatiga = calcularPuntajeFatiga(insp);
    const nuevasAlertas = tieneAlertasCriticas(insp, nuevoRiesgo);
    
    if (insp.nivel_riesgo !== nuevoRiesgo || 
        insp.puntaje_fatiga !== nuevoPuntajeFatiga ||
        insp.tiene_alertas_criticas !== nuevasAlertas) {
      
      if (insp.nivel_riesgo !== nuevoRiesgo) {
        const cambio = `${insp.nivel_riesgo}→${nuevoRiesgo}`;
        cambios[cambio] = (cambios[cambio] || 0) + 1;
      }
      
      await prisma.inspeccion.update({
        where: { id: insp.id },
        data: {
          nivel_riesgo: nuevoRiesgo,
          puntaje_fatiga: nuevoPuntajeFatiga,
          tiene_alertas_criticas: nuevasAlertas
        }
      });
      actualizadas++;
      
      if (actualizadas % 100 === 0) {
        process.stdout.write(`\r✅ Actualizadas: ${actualizadas}/${inspecciones.length}`);
      }
    } else {
      sinCambios++;
    }
  }
  
  console.log(`\n\n📈 Resumen de cambios:`);
  console.log(`   ✅ Actualizadas: ${actualizadas}`);
  console.log(`   ⏭️  Sin cambios: ${sinCambios}`);
  console.log(`\n🔄 Tipos de cambios:`);
  Object.entries(cambios).forEach(([tipo, count]) => {
    if (count > 0) console.log(`   ${tipo}: ${count}`);
  });
  
  // Verificar nueva distribución
  const stats = await prisma.inspeccion.groupBy({
    by: ['nivel_riesgo'],
    _count: true
  });
  
  console.log(`\n📊 Nueva distribución de riesgo:`);
  stats.forEach(s => {
    console.log(`   ${s.nivel_riesgo}: ${s._count._all}`);
  });
  
  console.log('\n✅ Recálculo completado exitosamente!');
}

recalcular()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
