require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  if (value === null || value === undefined) return false;
  if (typeof value !== 'string') return false;
  const v = value.trim().toUpperCase();
  if (["CUMPLE","SI","SÍ","TRUE","OK","X","1","YES","VERDADERO","Y"].includes(v)) return true;
  if (["NO CUMPLE","NO","FALSE","NA","NAN","0","FALSO","N"].includes(v)) return false;
  if (v === "") return false;
  return false;
}

async function corregirValoresLabrado() {
  console.log('🔧 CORRIGIENDO VALORES DE LABRADO EN REGISTROS IMPORTADOS\n');
  
  // 1. Leer el Excel para obtener los valores correctos
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total de registros en Excel: ${data.length}`);
  
  // 2. Identificar el nombre exacto de la columna de labrado
  const columnas = Object.keys(data[0]);
  const columnasLabrado = columnas.filter(col => 
    col.includes('Llantas') && col.includes('Labrado')
  );
  
  if (columnasLabrado.length === 0) {
    console.log('❌ No se encontró la columna de labrado');
    return;
  }
  
  const nombreColumnaLabrado = columnasLabrado[0];
  console.log(`✅ Columna de labrado identificada: "${nombreColumnaLabrado}"`);
  console.log(`   Longitud: ${nombreColumnaLabrado.length} caracteres\n`);
  
  // 3. Mostrar algunos valores de ejemplo
  console.log('📋 Valores de labrado en el Excel:');
  const valoresLabrado = data.slice(0, 10).map(row => row[nombreColumnaLabrado]);
  console.log(`   Valores únicos: ${[...new Set(valoresLabrado)].join(', ')}\n`);
  
  // 4. Procesar y actualizar cada registro
  console.log('🔄 Actualizando registros en la base de datos...\n');
  
  let actualizados = 0;
  let noEncontrados = 0;
  let errores = 0;
  
  for (const row of data) { // Procesar todos los registros
    try {
      const placa = row['PLACA DEL VEHICULO'] ? 
        String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const nombreInspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      
      if (!placa || !nombreInspector) continue;
      
      // Obtener el valor correcto de labrado del Excel
      const labradoValueExcel = row[nombreColumnaLabrado];
      const labradoCorregido = normalizeBoolean(labradoValueExcel);
      
      // Actualizar en la BD
      const resultado = await prisma.inspeccionPesado.updateMany({
        where: {
          placa_vehiculo: placa,
          nombre_inspector: nombreInspector,
          fecha: {
            gte: new Date('2025-10-20'), // Solo registros de octubre
            lt: new Date('2025-10-25')
          }
        },
        data: {
          llantas_labrado: labradoCorregido
        }
      });
      
      if (resultado.count > 0) {
        actualizados += resultado.count;
        if (actualizados <= 10) {
          console.log(`  ✓ ${placa} - ${nombreInspector}: "${labradoValueExcel}" -> ${labradoCorregido}`);
        }
      } else {
        noEncontrados++;
        if (noEncontrados <= 5) {
          console.log(`  ⚠️ No encontrado: ${placa} - ${nombreInspector}`);
        }
      }
      
    } catch (error) {
      errores++;
      if (errores <= 3) {
        console.log(`  ✗ Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DE CORRECCIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Registros actualizados: ${actualizados}`);
  console.log(`⚠️  No encontrados: ${noEncontrados}`);
  console.log(`❌ Errores: ${errores}`);
  
  // 5. Verificar el resultado
  console.log('\n📊 VERIFICANDO RESULTADO...');
  const verificacion = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true,
    where: {
      fecha: {
        gte: new Date('2025-10-20')
      }
    }
  });
  
  console.log('\nDistribución de labrado en registros de octubre 2025:');
  verificacion.forEach(v => {
    console.log(`  llantas_labrado = ${v.llantas_labrado}: ${v._count} registros`);
  });
  
  await prisma.$disconnect();
  console.log('\n✅ Corrección completada!');
}

corregirValoresLabrado().catch(console.error);