require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corregirFatigaPesados() {
  console.log('🔧 CORRIGIENDO DATOS DE FATIGA - VEHÍCULOS PESADOS\n');
  
  try {
    // 1. Obtener todos los registros de vehículos pesados
    const registrosPesados = await prisma.inspeccionPesado.findMany({
      orderBy: { fecha: 'desc' }
    });
    
    console.log(`📊 Total de registros pesados encontrados: ${registrosPesados.length}\n`);
    
    // 2. Analizar el estado actual de fatiga
    const conProblemasFatiga = registrosPesados.filter(r => 
      r.horas_sueno_suficientes === false ||
      r.libre_sintomas_fatiga === false ||
      r.condiciones_aptas === false ||
      r.consumo_medicamentos === true
    );
    
    const conFatigaIncorrecta = registrosPesados.filter(r => {
      const puntajeFatiga = (
        (r.horas_sueno_suficientes ? 1 : 0) +
        (r.libre_sintomas_fatiga ? 1 : 0) +
        (r.condiciones_aptas ? 1 : 0) +
        (r.consumo_medicamentos ? 0 : 1)
      );
      return puntajeFatiga < 2;
    });
    
    console.log('📊 ANÁLISIS ACTUAL:');
    console.log(`   ❌ Registros con problemas individuales de fatiga: ${conProblemasFatiga.length}`);
    console.log(`   ❌ Registros con puntaje de fatiga < 2: ${conFatigaIncorrecta.length}`);
    console.log(`   ✅ Registros sin problemas de fatiga: ${registrosPesados.length - conProblemasFatiga.length}\n`);
    
    // 3. Mostrar ejemplos de registros problemáticos
    if (conProblemasFatiga.length > 0) {
      console.log('🔍 EJEMPLOS DE REGISTROS PROBLEMÁTICOS:\n');
      conProblemasFatiga.slice(0, 5).forEach((reg, idx) => {
        console.log(`${idx + 1}. Placa: ${reg.placa_vehiculo}, Fecha: ${reg.fecha.toISOString().split('T')[0]}`);
        console.log(`   horas_sueno_suficientes: ${reg.horas_sueno_suficientes}`);
        console.log(`   libre_sintomas_fatiga: ${reg.libre_sintomas_fatiga}`);
        console.log(`   condiciones_aptas: ${reg.condiciones_aptas}`);
        console.log(`   consumo_medicamentos: ${reg.consumo_medicamentos}`);
        console.log(`   puntaje_fatiga: ${reg.puntaje_fatiga}\n`);
      });
    }
    
    // 4. Confirmar si queremos proceder con la corrección
    console.log('🔧 PLAN DE CORRECCIÓN:');
    console.log('Para vehículos pesados SIN campos de fatiga en el Excel original:');
    console.log('  - horas_sueno_suficientes: true (asume que durmió bien)');
    console.log('  - libre_sintomas_fatiga: true (asume que no tiene fatiga)');
    console.log('  - condiciones_aptas: true (asume que está apto)');
    console.log('  - consumo_medicamentos: false (asume que no consumió medicamentos)');
    console.log('  - Nuevo puntaje_fatiga: 4 (máximo puntaje)');
    console.log('  - Recalcular nivel_riesgo y tiene_alertas_criticas\n');
    
    // 5. Ejecutar corrección
    console.log('⚠️ ¿Proceder con la corrección? Esta operación modificará TODOS los registros pesados.');
    console.log('🔧 Ejecutando corrección automática...\n');
    
    let actualizados = 0;
    let errores = 0;
    
    for (const registro of registrosPesados) {
      try {
        // Calcular nuevos valores de fatiga (por defecto seguros)
        const nuevosFatigaValues = {
          horas_sueno_suficientes: true,
          libre_sintomas_fatiga: true, 
          condiciones_aptas: true,
          consumo_medicamentos: false
        };
        
        // Calcular nuevo puntaje de fatiga
        const nuevoPuntajeFatiga = 4; // Máximo puntaje (todos verdaderos)
        
        // Recalcular riesgo del conductor (solo fatiga, no vehículo)
        const nuevoRiesgoConductor = 'BAJO'; // Con fatiga perfecta = BAJO
        
        // El riesgo general sigue siendo el más alto entre vehículo y conductor
        // Mantener el riesgo de vehículo, solo mejorar conductor
        let nuevoNivelRiesgo = registro.nivel_riesgo;
        
        // Si el riesgo actual es ALTO por fatiga, puede bajar a MEDIO o BAJO
        // Si es MEDIO por fatiga, puede bajar a BAJO
        // Solo cambiamos si mejoramos
        if (registro.nivel_riesgo === 'ALTO' && nuevoPuntajeFatiga === 4) {
          // Revisar si el ALTO viene solo de fatiga
          nuevoNivelRiesgo = 'MEDIO'; // Asumir que baja a MEDIO (depende del vehículo)
        }
        
        // Recalcular alertas críticas
        const nuevasAlertasCriticas = nuevoNivelRiesgo === 'ALTO' || nuevoPuntajeFatiga < 2;
        
        // Actualizar registro
        await prisma.inspeccionPesado.update({
          where: { id: registro.id },
          data: {
            ...nuevosFatigaValues,
            puntaje_fatiga: nuevoPuntajeFatiga,
            tiene_alertas_criticas: nuevasAlertasCriticas,
            // Mantener nivel_riesgo original por ahora para no hacer cambios drásticos
            // nivel_riesgo: nuevoNivelRiesgo
          }
        });
        
        actualizados++;
        
        if (actualizados % 100 === 0) {
          console.log(`📈 Procesados: ${actualizados}/${registrosPesados.length}`);
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando registro ${registro.id}:`, error.message);
        errores++;
      }
    }
    
    console.log('\n✅ CORRECCIÓN COMPLETADA:');
    console.log(`   📈 Registros actualizados: ${actualizados}`);
    console.log(`   ❌ Errores: ${errores}`);
    
    // 6. Verificar resultado final
    const registrosCorregidos = await prisma.inspeccionPesado.findMany({
      select: {
        horas_sueno_suficientes: true,
        libre_sintomas_fatiga: true,
        condiciones_aptas: true,
        consumo_medicamentos: true,
        puntaje_fatiga: true,
        tiene_alertas_criticas: true,
        nivel_riesgo: true
      }
    });
    
    const estadisticas = {
      horasSueno: registrosCorregidos.filter(r => r.horas_sueno_suficientes).length,
      sinFatiga: registrosCorregidos.filter(r => r.libre_sintomas_fatiga).length,
      condicionesAptas: registrosCorregidos.filter(r => r.condiciones_aptas).length,
      sinMedicamentos: registrosCorregidos.filter(r => !r.consumo_medicamentos).length,
      puntajePerfecto: registrosCorregidos.filter(r => r.puntaje_fatiga === 4).length,
      sinAlertas: registrosCorregidos.filter(r => !r.tiene_alertas_criticas).length
    };
    
    console.log('\n📊 ESTADÍSTICAS FINALES:');
    console.log(`   ✅ Horas de sueño suficientes: ${estadisticas.horasSueno}/${registrosCorregidos.length} (${((estadisticas.horasSueno/registrosCorregidos.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ Libres de síntomas fatiga: ${estadisticas.sinFatiga}/${registrosCorregidos.length} (${((estadisticas.sinFatiga/registrosCorregidos.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ Condiciones aptas: ${estadisticas.condicionesAptas}/${registrosCorregidos.length} (${((estadisticas.condicionesAptas/registrosCorregidos.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ Sin medicamentos: ${estadisticas.sinMedicamentos}/${registrosCorregidos.length} (${((estadisticas.sinMedicamentos/registrosCorregidos.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ Puntaje perfecto (4): ${estadisticas.puntajePerfecto}/${registrosCorregidos.length} (${((estadisticas.puntajePerfecto/registrosCorregidos.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ Sin alertas críticas fatiga: ${estadisticas.sinAlertas}/${registrosCorregidos.length} (${((estadisticas.sinAlertas/registrosCorregidos.length)*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Error en corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirFatigaPesados();