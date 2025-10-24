require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function excelDateToISO(excelDate) {
  if (!excelDate) return null;
  
  // Si ya es una cadena con formato ISO o fecha, intentar parsearla
  if (typeof excelDate === 'string') {
    const d = new Date(excelDate);
    if (!isNaN(d.getTime())) return d.toISOString();
    return null;
  }
  
  // Si es un número (formato de Excel: días desde 1900-01-01)
  if (typeof excelDate === 'number') {
    // Excel fecha base: 1900-01-01 (pero Excel cuenta desde 1900-01-00, bug histórico)
    const excelEpoch = new Date(1899, 11, 30); // 30 dic 1899
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
  if (v === "") return false;
  return false;
}

async function corregirLabradoPesados() {
  console.log('🔧 CORRIGIENDO DATOS DE LABRADO DE NEUMÁTICOS - VEHÍCULOS PESADOS\n');
  
  // 1. Leer el Excel
  const archivoExcel = path.join(__dirname, '../../pruebas/HQ-FO-41 INSPECCIÓN DIARIA DE VEHÍCULOS PESADOS (respuestas) (12).xlsx');
  const workbook = XLSX.readFile(archivoExcel);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  console.log(`📊 Total de registros en Excel: ${data.length}\n`);
  
  // 2. Procesar cada fila del Excel y actualizar directamente en la BD
  console.log('🔄 Procesando y actualizando registros...\n');
  
  let actualizados = 0;
  let noEncontrados = 0;
  let errores = 0;
  
  for (const row of data) {
    try {
      const placa = row['PLACA DEL VEHICULO'] ? 
        String(row['PLACA DEL VEHICULO']).replace(/\s+/g, '').toUpperCase() : '';
      const nombreInspector = row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN'] ? 
        String(row['NOMBRE DE QUIEN REALIZA LA INSPECCIÓN']).trim() : '';
      const marcaTemporal = row['Marca temporal'];
      
      // Detectar automáticamente la columna correcta de labrado
      const columnas = Object.keys(row);
      const columnaLabrado = columnas.find(col => 
        col.includes('Llantas') && col.includes('Labrado') && col.includes('min 3mm')
      );
      
      const labradoValue = columnaLabrado ? row[columnaLabrado] : null;
      const labradoCorrecto = normalizeBoolean(labradoValue);
      
      if (!placa || !marcaTemporal) continue;
      
      // Convertir fecha Excel a ISO
      const fecha = excelDateToISO(marcaTemporal);
      if (!fecha) continue;
      
      // Buscar y actualizar en la BD
      const resultado = await prisma.inspeccionPesado.updateMany({
        where: {
          placa_vehiculo: placa,
          marca_temporal: new Date(fecha),
          nombre_inspector: nombreInspector
        },
        data: {
          llantas_labrado: labradoCorrecto
        }
      });
      
      if (resultado.count > 0) {
        actualizados += resultado.count;
        if (actualizados <= 5) {
          console.log(`  ✓ ${placa} - Inspector: ${nombreInspector} -> labrado: ${labradoCorrecto}`);
        }
      } else {
        noEncontrados++;
      }
    } catch (error) {
      errores++;
      if (errores <= 3) {
        console.log(`  ✗ Error procesando registro: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DE CORRECCIÓN');
  console.log('='.repeat(60));
  console.log(`Total registros del Excel: ${data.length}`);
  console.log(`✅ Actualizados en BD: ${actualizados}`);
  console.log(`⚠️  No encontrados en BD: ${noEncontrados}`);
  console.log(`❌ Errores: ${errores}`);
  
  // Verificar resultado final
  const verificacion = await prisma.inspeccionPesado.groupBy({
    by: ['llantas_labrado'],
    _count: true
  });
  
  console.log('\n📊 DISTRIBUCIÓN FINAL:');
  verificacion.forEach(v => {
    console.log(`  llantas_labrado = ${v.llantas_labrado}: ${v._count} registros`);
  });
  
  await prisma.$disconnect();
  console.log('\n✅ Proceso completado!');
}

corregirLabradoPesados().catch(console.error);
