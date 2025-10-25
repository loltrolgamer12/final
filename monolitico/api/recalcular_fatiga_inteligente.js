require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const excelService = require('./src/services/excelService');
const excelParser = require('./src/utils/excelParser');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function recalcularFatigaInteligente() {
  console.log('🧠 RECALCULACIÓN INTELIGENTE DE FATIGA - VEHÍCULOS PESADOS\n');
  
  try {
    // 1. Leer datos originales del Excel
    console.log('📖 Leyendo datos originales del Excel...\n');
    const archivoPath = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
    const buffer = fs.readFileSync(archivoPath);
    const excelData = excelParser.parseExcel(buffer);
    
    console.log(`📊 Excel: ${excelData.length} registros totales\n`);
    
    // 2. Obtener registros de la base de datos
    const dbData = await prisma.inspeccionPesado.findMany({
      orderBy: { fecha: 'desc' }
    });
    
    console.log(`🗄️ Base de datos: ${dbData.length} registros totales\n`);
    
    // 3. Función para parsear fechas
    function parseExcelDate(excelDate) {
      if (!excelDate) return null;
      if (typeof excelDate === 'string') {
        const d = new Date(excelDate);
        return isNaN(d.getTime()) ? null : d;
      }
      if (typeof excelDate === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const msPerDay = 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }
    
    // 4. Mapear registros del Excel con sus datos de fatiga
    const excelConFatiga = excelData.map(row => {
      const fecha = parseExcelDate(row['Marca temporal']);
      const placa = row['PLACA DEL VEHICULO'] ? row['PLACA DEL VEHICULO'].toString().replace(/\s+/g, '').toUpperCase() : '';
      const inspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] || '';
      
      // Procesar datos usando la lógica del backend
      const datosProcesados = excelService.mapRecordPesado(row);
      
      return {
        fecha: fecha,
        placa: placa,
        inspector: inspector,
        // Datos de fatiga originales del Excel
        horas_sueno_suficientes: datosProcesados.horas_sueno_suficientes,
        libre_sintomas_fatiga: datosProcesados.libre_sintomas_fatiga,
        condiciones_aptas: datosProcesados.condiciones_aptas,
        consumo_medicamentos: datosProcesados.consumo_medicamentos,
        puntaje_fatiga: datosProcesados.puntaje_fatiga || excelService.calcularPuntajeFatiga(datosProcesados),
        nivel_riesgo: datosProcesados.nivel_riesgo || excelService.calcularRiesgo(datosProcesados),
        tiene_alertas_criticas: datosProcesados.tiene_alertas_criticas || excelService.tieneAlertasCriticas(datosProcesados)
      };
    }).filter(r => r.fecha !== null);
    
    console.log(`📋 Registros del Excel procesados: ${excelConFatiga.length}\n`);
    
    // 5. Actualizar registros en la base de datos con datos reales
    let actualizados = 0;
    let sinMatch = 0;
    let errores = 0;
    
    console.log('🔄 Actualizando registros con datos reales del Excel...\n');
    
    for (const regExcel of excelConFatiga) {
      try {
        // Buscar registro correspondiente en la BD
        const matches = dbData.filter(regBD => {
          if (!regBD.fecha || !regExcel.fecha) return false;
          
          const fechaBD = new Date(regBD.fecha);
          const fechaExcel = new Date(regExcel.fecha);
          
          // Comparar por día y criterios de identificación
          const mismaFecha = fechaBD.toDateString() === fechaExcel.toDateString();
          const mismaPlaca = regBD.placa_vehiculo === regExcel.placa;
          const mismoInspector = regBD.nombre_inspector === regExcel.inspector;
          
          return mismaFecha && mismaPlaca && mismoInspector;
        });
        
        if (matches.length === 1) {
          const regBD = matches[0];
          
          // Actualizar solo si los valores han cambiado
          const cambios = {};
          
          if (regBD.horas_sueno_suficientes !== regExcel.horas_sueno_suficientes) {
            cambios.horas_sueno_suficientes = regExcel.horas_sueno_suficientes;
          }
          if (regBD.libre_sintomas_fatiga !== regExcel.libre_sintomas_fatiga) {
            cambios.libre_sintomas_fatiga = regExcel.libre_sintomas_fatiga;
          }
          if (regBD.condiciones_aptas !== regExcel.condiciones_aptas) {
            cambios.condiciones_aptas = regExcel.condiciones_aptas;
          }
          if (regBD.consumo_medicamentos !== regExcel.consumo_medicamentos) {
            cambios.consumo_medicamentos = regExcel.consumo_medicamentos;
          }
          if (regBD.puntaje_fatiga !== regExcel.puntaje_fatiga) {
            cambios.puntaje_fatiga = regExcel.puntaje_fatiga;
          }
          if (regBD.tiene_alertas_criticas !== regExcel.tiene_alertas_criticas) {
            cambios.tiene_alertas_criticas = regExcel.tiene_alertas_criticas;
          }
          
          // Solo actualizar si hay cambios
          if (Object.keys(cambios).length > 0) {
            await prisma.inspeccionPesado.update({
              where: { id: regBD.id },
              data: cambios
            });
            
            actualizados++;
            
            if (actualizados % 100 === 0) {
              console.log(`📈 Actualizados: ${actualizados}`);
            }
          }
          
        } else if (matches.length === 0) {
          sinMatch++;
        } else {
          // Múltiples matches - tomar el primero
          console.log(`⚠️ Múltiples matches para ${regExcel.placa} ${regExcel.fecha.toISOString().split('T')[0]}`);
        }
        
      } catch (error) {
        console.error(`❌ Error actualizando: ${error.message}`);
        errores++;
      }
    }
    
    console.log('\n✅ ACTUALIZACIÓN COMPLETADA:');
    console.log(`   📈 Registros actualizados: ${actualizados}`);
    console.log(`   ❓ Sin match en BD: ${sinMatch}`);
    console.log(`   ❌ Errores: ${errores}\n`);
    
    // 6. Verificar resultado final
    const estadisticasFinales = await prisma.inspeccionPesado.aggregate({
      _count: { id: true },
      _avg: { puntaje_fatiga: true }
    });
    
    const distribucionFatiga = await prisma.inspeccionPesado.groupBy({
      by: ['puntaje_fatiga'],
      _count: { id: true },
      orderBy: { puntaje_fatiga: 'desc' }
    });
    
    console.log('📊 ESTADÍSTICAS FINALES:');
    console.log(`   📊 Total registros: ${estadisticasFinales._count.id}`);
    console.log(`   📊 Puntaje promedio fatiga: ${estadisticasFinales._avg.puntaje_fatiga?.toFixed(2)}`);
    console.log('\n📊 DISTRIBUCIÓN DE PUNTAJES DE FATIGA:');
    
    distribucionFatiga.forEach(dist => {
      const porcentaje = ((dist._count.id / estadisticasFinales._count.id) * 100).toFixed(1);
      console.log(`   Puntaje ${dist.puntaje_fatiga}: ${dist._count.id} registros (${porcentaje}%)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalcularFatigaInteligente();