require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function excelDateToISO(excelDate) {
  if (!excelDate) return null;
  
  if (typeof excelDate === 'string') {
    const d = new Date(excelDate);
    if (!isNaN(d.getTime())) return d.toISOString();
    return null;
  }
  
  if (typeof excelDate === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const date = new Date(excelEpoch.getTime() + excelDate * msPerDay);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  
  return null;
}

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  return false;
}

async function corregirTodosDatosExcel() {
  console.log('🔧 CORRIGIENDO TODOS LOS DATOS BASÁNDOSE EN EL EXCEL COMPLETO\n');
  
  // 1. Leer el Excel
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total de registros en Excel: ${data.length}`);
  
  // 2. Identificar columna correcta
  const columnas = Object.keys(data[0]);
  const columnasLabrado = columnas.filter(col => 
    col.includes('Llantas') && col.includes('Labrado')
  );
  const nombreColumnaLabrado = columnasLabrado[0];
  
  console.log(`✅ Usando columna: "${nombreColumnaLabrado}"`);
  
  // 3. Análisis previo
  const valoresLabrado = data.map(row => row[nombreColumnaLabrado]);
  const cumple = valoresLabrado.filter(v => v === 'CUMPLE').length;
  const noCumple = valoresLabrado.filter(v => v === 'NO CUMPLE').length;
  
  console.log(`📋 Valores en Excel: ${cumple} CUMPLE, ${noCumple} NO CUMPLE\n`);
  
  // 4. Procesar TODOS los registros
  console.log('🔄 Procesando TODOS los registros del Excel...\n');
  
  let actualizados = 0;
  let noEncontrados = 0;
  let errores = 0;
  let procesados = 0;
  
  for (const row of data) {
    try {
      procesados++;
      
      // Extraer datos del registro
      const placa = row['PLACA DEL VEHICULO'] ? 
        String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const nombreInspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      const marcaTemporal = row['Marca temporal'];
      
      if (!placa || !nombreInspector || !marcaTemporal) {
        if (procesados <= 5) {
          console.log(`  ⚠️ Datos incompletos en registro ${procesados}: placa="${placa}", inspector="${nombreInspector}"`);
        }
        continue;
      }
      
      // Convertir fecha
      const fecha = excelDateToISO(marcaTemporal);
      if (!fecha) continue;
      
      // Obtener valor correcto del Excel
      const labradoValueExcel = row[nombreColumnaLabrado];
      const labradoCorregido = normalizeBoolean(labradoValueExcel);
      
      // Buscar registros que coincidan y actualizar
      const registrosActualizados = await prisma.inspeccionPesado.updateMany({
        where: {
          placa_vehiculo: placa,
          nombre_inspector: nombreInspector,
          // Buscar por fecha aproximada (mismo día)
          fecha: {
            gte: new Date(new Date(fecha).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(fecha).setHours(23, 59, 59, 999))
          }
        },
        data: {
          llantas_labrado: labradoCorregido
        }
      });
      
      if (registrosActualizados.count > 0) {
        actualizados += registrosActualizados.count;
        
        // Mostrar progreso de los primeros 10
        if (actualizados <= 10) {
          console.log(`  ✓ ${placa} - ${nombreInspector}: "${labradoValueExcel}" -> ${labradoCorregido}`);
        }
        
        // Mostrar progreso cada 500 registros
        if (procesados % 500 === 0) {
          console.log(`  📈 Procesados: ${procesados}/${data.length} | Actualizados: ${actualizados}`);
        }
      } else {
        noEncontrados++;
        
        if (noEncontrados <= 5) {
          console.log(`  ⚠️ No encontrado: ${placa} - ${nombreInspector} (${new Date(fecha).toLocaleDateString()})`);
        }
      }
      
    } catch (error) {
      errores++;
      if (errores <= 3) {
        console.log(`  ✗ Error procesando registro ${procesados}: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('RESUMEN FINAL DE CORRECCIÓN COMPLETA');
  console.log('='.repeat(70));
  console.log(`📊 Total registros procesados: ${procesados}`);
  console.log(`✅ Registros actualizados en BD: ${actualizados}`);
  console.log(`⚠️  No encontrados en BD: ${noEncontrados}`);
  console.log(`❌ Errores: ${errores}`);
  
  // 5. Verificación final
  console.log('\n📊 VERIFICANDO RESULTADO FINAL...');
  
  const verificacionTotal = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true
  });
  
  console.log('\nDistribución GLOBAL después de corrección:');
  const totalRegistros = verificacionTotal.reduce((sum, v) => sum + v._count, 0);
  verificacionTotal.forEach(v => {
    const porcentaje = ((v._count / totalRegistros) * 100).toFixed(1);
    console.log(`  llantas_labrado = ${v.llantas_labrado}: ${v._count} (${porcentaje}%)`);
  });
  
  // Verificación específica de octubre
  const verificacionOctubre = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-10-01'),
        lt: new Date('2025-11-01')
      }
    }
  });
  
  console.log('\nDistribución OCTUBRE 2025 después de corrección:');
  const totalOctubre = verificacionOctubre.reduce((sum, v) => sum + v._count, 0);
  verificacionOctubre.forEach(v => {
    const porcentaje = ((v._count / totalOctubre) * 100).toFixed(1);
    console.log(`  llantas_labrado = ${v.llantas_labrado}: ${v._count} (${porcentaje}%)`);
  });
  
  // Comparar con valores esperados del Excel
  const expectedTrue = Math.round((cumple / data.length) * totalOctubre);
  const expectedFalse = Math.round((noCumple / data.length) * totalOctubre);
  const actualTrue = verificacionOctubre.find(v => v.llantas_labrado === true)?._count || 0;
  const actualFalse = verificacionOctubre.find(v => v.llantas_labrado === false)?._count || 0;
  
  console.log('\n🎯 COMPARACIÓN CON EXCEL:');
  console.log(`  Esperado: ~${expectedTrue} true, ~${expectedFalse} false`);
  console.log(`  Real BD:  ${actualTrue} true, ${actualFalse} false`);
  
  if (Math.abs(actualTrue - expectedTrue) < 50) {
    console.log('  ✅ ¡Los valores coinciden con el Excel!');
  } else {
    console.log('  ⚠️  Hay diferencias significativas');
  }
  
  await prisma.$disconnect();
  console.log('\n🎉 Corrección completa terminada!');
}

corregirTodosDatosExcel().catch(console.error);